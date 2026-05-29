# frozen_string_literal: true
#
# INSTALL: Copy this file to the Plugins folder ROOT (not inside sketchlib-plugin).
#
#   Plugins/
#     load_sketchlib.rb          ← this file
#     sketchlib-plugin/        ← whole folder (sketchlib.rb, sketchlib/, ui/, …)
#
# SketchUp only auto-loads .rb files directly in Plugins on many versions.
# Files buried in subfolders are skipped unless this loader is present.

require File.join(File.dirname(__FILE__), 'sketchlib-plugin', 'sketchlib.rb')
