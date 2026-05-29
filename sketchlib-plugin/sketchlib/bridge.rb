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

    # Phase 4: download presigned URL to a temp .skp, load locally, then unlink.
    # definitions.load(signed_url) is unreliable (long R2 query strings break SketchUp).
    def self.download_and_insert(dialog, signed_url, model_name)
      require 'net/http'
      require 'tempfile'
      require 'uri'

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

      definition = model.definitions.load(tmp.path)
      transform = Geom::Transformation.new(ORIGIN)
      model.active_entities.add_instance(definition, transform)
      model.active_view.zoom_extents
      tmp.unlink

      safe_name = model_name.to_s.gsub("'", "\\\\'")
      dialog.execute_script("window.onModelInserted && window.onModelInserted('#{safe_name}')")
    rescue StandardError => e
      tmp&.unlink
      safe_msg = e.message.gsub("'", "\\\\'")
      dialog.execute_script("window.onInsertError && window.onInsertError('#{safe_msg}')")
    end

    def self.insert_model(dialog, signed_url, model_name)
      download_and_insert(dialog, signed_url, model_name)
    end
  end
end
