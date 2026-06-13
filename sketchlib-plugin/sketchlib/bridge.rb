# frozen_string_literal: true

module SketchLib
  module Bridge
    # Dev: http://localhost:8000/api — override in production deploy docs.
    API_URL = ENV.fetch('SKETCHLIB_API_URL', 'http://localhost:8000/api').freeze

    def self.get_hardware_id
      id = read_platform_uuid
      return id if id && !id.empty?

      fallback_hardware_id
    rescue StandardError
      fallback_hardware_id
    end

    def self.read_platform_uuid
      if windows?
        result = `wmic csproduct get UUID 2>nul`
        result.split("\n").map(&:strip).reject(&:empty?).last.to_s.strip
      elsif mac?
        result = `system_profiler SPHardwareDataType 2>/dev/null | awk '/Hardware UUID/ { print $3 }'`
        result.strip
      elsif linux?
        `cat /sys/class/dmi/id/product_uuid 2>/dev/null`.strip
      else
        ''
      end
    end

    def self.windows?
      Sketchup.platform == :platform_win
    rescue StandardError
      RUBY_PLATFORM =~ /mswin|mingw|cygwin/i
    end

    def self.mac?
      Sketchup.platform == :platform_osx
    rescue StandardError
      RUBY_PLATFORM =~ /darwin/i
    end

    def self.linux?
      !windows? && !mac? && (RUBY_PLATFORM =~ /linux/i)
    end

    def self.fallback_hardware_id
      require 'digest'
      seed = [
        ENV['COMPUTERNAME'],
        ENV['USERNAME'],
        ENV['USER'],
        ENV['HOSTNAME'],
      ].compact.join('-')
      Digest::SHA256.hexdigest(seed)[0..35]
    end

    # Download .skp locally, load definition, then activate click-to-place tool.
    def self.download_and_prepare(dialog, signed_url, model_name)
      require 'net/http'
      require 'tempfile'
      require 'uri'
      require_relative 'placement_tool'

      uri = URI.parse(signed_url)
      tmp = Tempfile.new(['sketchlib_', '.skp'])
      tmp.binmode

      use_ssl = uri.scheme == 'https'
      port = uri.port || (use_ssl ? 443 : 80)

      Net::HTTP.start(uri.host, port, use_ssl: use_ssl) do |http|
        http.request(Net::HTTP::Get.new(uri.request_uri)) do |res|
          raise "Download failed: HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)

          res.read_body { |chunk| tmp.write(chunk) }
        end
      end
      tmp.close

      model = Sketchup.active_model
      raise 'No active model' unless model

      definition = load_skp_definition(model, tmp.path)
      tmp.unlink

      model.select_tool(PlacementTool.new(definition, model_name, dialog))
      dialog.execute_script('window.onPlacementMode && window.onPlacementMode()')
    rescue StandardError => e
      tmp&.unlink
      safe_msg = js_escape(friendly_insert_error(e))
      dialog.execute_script("window.onInsertError && window.onInsertError('#{safe_msg}')")
    end

    def self.insert_model(dialog, signed_url, model_name)
      download_and_prepare(dialog, signed_url, model_name)
    end

    def self.js_escape(str)
      str.to_s.gsub('\\', '\\\\\\\\').gsub("'", "\\\\'").gsub("\n", ' ')
    end

    # Load .skp across SketchUp 2020–2026. Newer file formats need allow_newer (SU 2022+).
    def self.load_skp_definition(model, path)
      defs = model.definitions
      load_definition(defs, path, use_allow_newer: true)
    rescue ArgumentError
      # SketchUp 2020–2021: no allow_newer keyword on DefinitionList#load
      load_definition(defs, path, use_allow_newer: false)
    end

    def self.load_definition(defs, path, use_allow_newer:)
      if use_allow_newer
        defs.load(path, allow_newer: true)
      else
        defs.load(path)
      end
    rescue RuntimeError => e
      raise version_mismatch_error(e) if newer_version_error?(e)
      raise
    end

    def self.newer_version_error?(error)
      error.message.match?(/newer model version|allow_newer/i)
    end

    def self.version_mismatch_error(_original)
      RuntimeError.new(
        "This model was saved in a newer SketchUp version. You are on SketchUp #{sketchup_year_label}. " \
        'Use SketchUp 2022 or newer for the full catalog, or models exported for your version.'
      )
    end

    def self.friendly_insert_error(error)
      return error.message unless newer_version_error?(error)

      version_mismatch_error(error).message
    end

    def self.sketchup_year_label
      major = sketchup_major_version.to_i
      return "20#{major}" if major >= 20 && major < 100

      Sketchup.version.to_s
    rescue StandardError
      'your SketchUp version'
    end

    def self.sketchup_major_version
      Sketchup.version.to_f
    rescue StandardError
      0.0
    end
  end
end
