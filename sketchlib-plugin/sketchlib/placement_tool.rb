# frozen_string_literal: true

module SketchLib
  # Click-to-place tool: preview follows cursor until user clicks in the scene.
  class PlacementTool
    BOX_EDGES = [
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ].freeze

    def initialize(definition, model_name, dialog)
      @definition = definition
      @model_name = model_name.to_s
      @dialog     = dialog
      @ip         = Sketchup::InputPoint.new
      @placed     = false
    end

    def activate
      update_status_bar
      Sketchup.active_model.active_view.invalidate
    end

    def resume(view)
      update_status_bar
      view.invalidate
    end

    def deactivate(view)
      view.invalidate
    end

    def onMouseMove(_flags, x, y, view)
      @ip.pick(view, x, y)
      view.invalidate
    end

    def draw(view)
      return unless @ip.valid?

      view.draw_points([@ip.position], 10, 4, 'blue')

      bounds = @definition.bounds
      transform = Geom::Transformation.new(@ip.position)
      corners = (0..7).map { |i| transform * bounds.corner(i) }

      view.drawing_color = Sketchup::Color.new(0, 120, 255, 128)
      view.line_width = 1

      lines = BOX_EDGES.flat_map { |a, b| [corners[a], corners[b]] }
      view.draw(GL_LINES, lines)
    end

    def onLButtonDown(_flags, x, y, view)
      @ip.pick(view, x, y)
      return unless @ip.valid?

      model = Sketchup.active_model
      transform = Geom::Transformation.new(@ip.position)

      model.start_operation("Insert #{@model_name}", true)
      model.active_entities.add_instance(@definition, transform)
      model.commit_operation

      @placed = true
      model.select_tool(nil)
      notify_js('onModelInserted', @model_name)
    end

    def onCancel(_reason, _view)
      Sketchup.active_model.select_tool(nil) unless @placed
      notify_js('onInsertCancelled')
    end

    def getInstructorContentDirectory
      nil
    end

    private

    def update_status_bar
      text = "Click to place #{@model_name}  |  Esc to cancel"
      if Sketchup.respond_to?(:status_text=)
        Sketchup.status_text = text
      else
        Sketchup.set_status_text(text, SB_PROMPT)
      end
    end

    def notify_js(callback, arg = nil)
      if arg
        safe = Bridge.js_escape(arg)
        @dialog.execute_script("window.#{callback} && window.#{callback}('#{safe}')")
      else
        @dialog.execute_script("window.#{callback} && window.#{callback}()")
      end
    end
  end
end
