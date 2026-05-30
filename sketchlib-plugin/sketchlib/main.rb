# frozen_string_literal: true

require_relative 'bridge'

module SketchLib
  module Main
    DIST_DIR   = File.join(SketchLib::PLUGIN_DIR, 'ui', 'dist').freeze
    SHELL_PATH = File.join(DIST_DIR, 'shell.html').freeze
    JS_PATH    = File.join(DIST_DIR, 'app.js').freeze
    CSS_PATH   = File.join(DIST_DIR, 'app.css').freeze

    # app.js must be the full Vite bundle (~140KB+). Smaller = stale/wrong copy from GitHub.
    MIN_APP_JS_BYTES = 100_000

    def self.ui_files_ok?
      return false unless File.exist?(SHELL_PATH) && File.exist?(JS_PATH)

      File.size(JS_PATH) >= MIN_APP_JS_BYTES
    end

    def self.ui_error_message
      js_size = File.exist?(JS_PATH) ? File.size(JS_PATH) : 0
      <<~MSG.strip
        SketchLib UI files missing or outdated.

        Expected in:
        #{DIST_DIR}

        • shell.html (small)
        • app.js (~147 KB) — you have #{js_size} bytes
        • app.css (optional)

        Reinstall the latest .rbz from the website, or rebuild ui/dist and run build-rbz.sh.
        Do NOT use an old index.html (~104 KB); that file is no longer used.
      MSG
    end

    def self.build_ui_html
      shell = File.read(SHELL_PATH)
      js = File.read(JS_PATH)
      css = File.exist?(CSS_PATH) ? File.read(CSS_PATH) : ''

      safe_js = js.gsub(%r{</script}i, '<\\/script')
      safe_css = css.gsub(%r{</style}i, '<\\/style')

      shell
        .sub('<!-- SKETCHLIB_CSS -->', css.empty? ? '' : "<style>#{safe_css}</style>")
        .sub('<!-- SKETCHLIB_APP_JS -->', "<script>#{safe_js}</script>")
    end

    def self.open_dialog
      if @dialog&.visible?
        @dialog.bring_to_front
        return
      end

      unless ui_files_ok?
        UI.messagebox(ui_error_message, MB_OK)
        return
      end

      @dialog = UI::HtmlDialog.new(
        dialog_title: 'SketchLib',
        scrollable: false,
        resizable: true,
        width: 420,
        height: 680,
        min_width: 380,
        min_height: 600,
        style: UI::HtmlDialog::STYLE_UTILITY
      )

      @dialog.set_html(build_ui_html)

      @dialog.add_action_callback('getHardwareId') do |_ctx|
        hardware_id = Bridge.get_hardware_id
        safe_id = hardware_id.to_s.gsub("'", "\\\\'")
        @dialog.execute_script("window.receiveHardwareId && window.receiveHardwareId('#{safe_id}')")
      end

      @dialog.add_action_callback('insertModel') do |_ctx, signed_url, model_name|
        Bridge.insert_model(@dialog, signed_url, model_name)
      end

      @dialog.add_action_callback('saveToken') do |_ctx, token|
        Sketchup.write_default('SketchLib', 'auth_token', token.to_s)
      end

      @dialog.add_action_callback('getSavedToken') do |_ctx|
        token = Sketchup.read_default('SketchLib', 'auth_token', '')
        safe_token = token.to_s.gsub("'", "\\\\'")
        @dialog.execute_script("window.receiveSavedToken && window.receiveSavedToken('#{safe_token}')")
      end

      @dialog.add_action_callback('clearToken') do |_ctx|
        Sketchup.write_default('SketchLib', 'auth_token', '')
        @dialog.execute_script("window.receiveSavedToken && window.receiveSavedToken('')")
      end

      @dialog.show
    end

    unless file_loaded?(__FILE__)
      menu = UI.menu('Extensions')
      menu.add_item('SketchLib') { Main.open_dialog }
      file_loaded(__FILE__)
    end
  end
end
