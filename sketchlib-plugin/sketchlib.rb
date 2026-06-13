# frozen_string_literal: true

require 'sketchup'
require 'extensions'

module SketchLib
  registrar_dir = File.dirname(__FILE__).freeze
  rbz_support = File.join(registrar_dir, 'sketchlib')

  # RBZ install: Plugins/sketchlib.rb + Plugins/sketchlib/ (ui inside support folder)
  if File.exist?(File.join(rbz_support, 'main.rb')) &&
     File.directory?(File.join(rbz_support, 'ui'))
    PLUGIN_DIR = rbz_support.freeze
    EXTENSION_ENTRY = 'sketchlib/main'.freeze
  else
    # Legacy manual zip: Plugins/sketchlib-plugin/ with ui at folder root
    PLUGIN_DIR = registrar_dir.freeze
    EXTENSION_ENTRY = File.join(registrar_dir, 'sketchlib', 'main.rb').freeze
  end

  extension = SketchupExtension.new('SketchLib', EXTENSION_ENTRY)

  extension.description = 'Browse and insert curated 3D furniture models from SketchLib.'
  extension.version     = '1.1.0'
  extension.copyright   = '2026 SketchLib'

  Sketchup.register_extension(extension, true)
end
