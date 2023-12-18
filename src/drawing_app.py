import tkinter as tk
from tkinter import simpledialog
from PIL import Image, ImageDraw
import math

class CanvasManager:
    def __init__(self, canvas, width, height):
        self.canvas = canvas
        self.width = width
        self.height = height
        self.image = Image.new("RGB", (self.width, self.height), 'white')
        self.draw = ImageDraw.Draw(self.image)
        self.symmetry = 8
        self.strokes = []
        self.current_stroke = []
        self.line_width = 1
        self.color = 'black'
        self.old_x = None
        self.old_y = None

    def set_symmetry(self, symmetry):
        self.symmetry = symmetry

    def paint(self, x, y):
        if self.old_x and self.old_y:
            for i in range(self.symmetry):
                angle = (2 * math.pi / self.symmetry) * i
                x_rotated, y_rotated = self.rotate_point(x, y, angle)
                x_old_rotated, y_old_rotated = self.rotate_point(self.old_x, self.old_y, angle)
                self.canvas.create_line((x_rotated, y_rotated, x_old_rotated, y_old_rotated),
                                        width=self.line_width, fill=self.color,
                                        capstyle=tk.ROUND, smooth=tk.TRUE, splinesteps=36)
                self.current_stroke.append((x_rotated, y_rotated, x_old_rotated, y_old_rotated))

        self.old_x = x
        self.old_y = y

    def record_stroke(self):
        if self.current_stroke:
            self.strokes.append(self.current_stroke)
            self.current_stroke = []
        self.reset()

    def reset(self):
        self.old_x = None
        self.old_y = None

    def rotate_point(self, x, y, angle):
        cx, cy = self.width / 2, self.height / 2
        x -= cx
        y -= cy
        new_x = x * math.cos(angle) - y * math.sin(angle)
        new_y = x * math.sin(angle) + y * math.cos(angle)
        return new_x + cx, new_y + cy

    def undo(self):
        if self.strokes:
            self.strokes.pop()
            self.redraw_canvas()

    def redraw_canvas(self):
        self.canvas.delete("all")
        self.image = Image.new("RGB", (self.width, self.height), 'white')
        self.draw = ImageDraw.Draw(self.image)

        for stroke in self.strokes:
            for line in stroke:
                self.canvas.create_line(line, width=self.line_width, fill=self.color, capstyle=tk.ROUND, smooth=tk.TRUE, splinesteps=36)
                self.draw.line(line, fill=self.color, width=self.line_width)
    
    def resize(self, new_width, new_height):
        self.width = new_width
        self.height = new_height
        self.init_canvas()
        self.redraw_canvas()

    def zoom(self, factor):
        self.canvas.scale("all", self.width / 2, self.height / 2, factor, factor)
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))


class DrawingApp:
    def __init__(self, root, width=800, height=600):
        self.root = root
        self.canvas_width = width
        self.canvas_height = height
        self.canvas = tk.Canvas(root, bg='white', width=self.canvas_width, height=self.canvas_height)
        self.canvas.pack(padx=10, pady=10)
        self.canvas_manager = CanvasManager(self.canvas, self.canvas_width, self.canvas_height)
       
        self.setup()
        self.add_controls()
        self.bind_mouse_wheel()


    def setup(self):
        self.canvas.bind('<B1-Motion>', self.on_paint)
        self.canvas.bind('<ButtonRelease-1>', self.on_release)

    def add_controls(self):
        control_frame = tk.Frame(self.root)
        control_frame.pack(side=tk.TOP, pady=5)

        symmetry_button = tk.Button(control_frame, text='Set Symmetry', command=self.set_symmetry)
        symmetry_button.pack(side=tk.LEFT, padx=5)

        undo_button = tk.Button(control_frame, text='Undo', command=self.canvas_manager.undo)
        undo_button.pack(side=tk.LEFT, padx=5)

        zoom_in_button = tk.Button(control_frame, text='Zoom In', command=lambda: self.canvas_manager.zoom(1.1))
        zoom_in_button.pack(side=tk.LEFT, padx=5)

        zoom_out_button = tk.Button(control_frame, text='Zoom Out', command=lambda: self.canvas_manager.zoom(0.9))
        zoom_out_button.pack(side=tk.LEFT, padx=5)

        # Slider for adjusting line width (made wider for easier sliding)
        self.line_width_slider = tk.Scale(self.root, from_=1, to=20, orient=tk.HORIZONTAL, label="Line Width", length=300)
        self.line_width_slider.set(1)  # Default line width
        self.line_width_slider.pack(side=tk.TOP, pady=5)

        self.line_width_slider.bind("<Motion>", self.on_line_width_change)


    def on_line_width_change(self, event=None):
        new_width = self.line_width_slider.get()
        self.canvas_manager.line_width = new_width



    def bind_mouse_wheel(self):
        # Bind mouse wheel event for zooming
        self.canvas.bind("<MouseWheel>", self.on_mouse_wheel)  # For Windows and MacOS
        self.canvas.bind("<Button-4>", self.on_mouse_wheel)    # For Linux (Scroll Up)
        self.canvas.bind("<Button-5>", self.on_mouse_wheel)    # For Linux (Scroll Down)

    def on_mouse_wheel(self, event):
        # Adjust the zoom factor as needed
        zoom_factor = 1.1
        if event.num == 5 or (event.delta < 0):  # Scroll down or mouse wheel down
            zoom_factor = 0.9

        self.canvas_manager.zoom(zoom_factor)

    def set_symmetry(self):
        symmetry = simpledialog.askinteger("Symmetry", "Enter number of axes:", minvalue=1)
        if symmetry is not None:
            self.canvas_manager.set_symmetry(symmetry)

    def on_paint(self, event):
        self.canvas_manager.paint(event.x, event.y)

    def on_release(self, event):
        self.canvas_manager.record_stroke()

    def resize_canvas(self, new_width, new_height):
        self.canvas.config(width=new_width, height=new_height)
        self.canvas_manager.resize(new_width, new_height)

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Symmetrical Drawing App")

    canvas_size = 1800
    app = DrawingApp(root, canvas_size, canvas_size)  # Pass initial size here
    root.mainloop()
