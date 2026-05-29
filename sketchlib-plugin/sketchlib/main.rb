# frozen_string_literal: true

require_relative 'bridge'

module SketchLib
  module Main
    UI_PATH = File.join(SketchLib::PLUGIN_DIR, 'ui', 'dist', 'index.html').freeze

    def self.open_dialog
      if @dialog&.visible?
        @dialog.bring_to_front
        return
      end

      unless File.exist?(UI_PATH)
        UI.messagebox(
          "SketchLib UI not found:\n#{UI_PATH}\n\nExpected ui/dist/index.html (Phase 1 placeholder).",
          MB_OK
        )
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

      @dialog.set_file(UI_PATH)

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
