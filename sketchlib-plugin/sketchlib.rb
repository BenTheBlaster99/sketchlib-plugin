# frozen_string_literal: true

require 'sketchup'
require 'extensions'

module SketchLib
  PLUGIN_DIR = File.dirname(__FILE__).freeze

  extension = SketchupExtension.new(
    'SketchLib',
    File.join(PLUGIN_DIR, 'sketchlib', 'main.rb')
  )

  extension.description = 'Browse and insert curated 3D furniture models from SketchLib.'
  extension.version     = '1.0.1'
  extension.copyright   = '2026 SketchLib'

  Sketchup.register_extension(extension, true)
end
