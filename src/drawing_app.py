import tkinter as tk
from tkinter import simpledialog, colorchooser
from PIL import Image, ImageDraw
import math

class SymmetryManager:
    def __init__(self, width, height, symmetry=8):
        self.width = width
        self.height = height
        self.symmetry = symmetry

    def set_symmetry(self, symmetry):
        self.symmetry = symmetry

    def calculate_rotated_points(self, x, y, old_x, old_y):
        rotated_points = []
        for i in range(self.symmetry):
            angle = (2 * math.pi / self.symmetry) * i
            rotated_points.append((self.rotate_point(x, y, angle), self.rotate_point(old_x, old_y, angle)))
        return rotated_points

    def rotate_point(self, x, y, angle):
        center_x, center_y = self.width / 2, self.height / 2
        x_translated, y_translated = x - center_x, y - center_y
        x_rotated = x_translated * math.cos(angle) - y_translated * math.sin(angle)
        y_rotated = x_translated * math.sin(angle) + y_translated * math.cos(angle)
        return x_rotated + center_x, y_rotated + center_y

class CanvasManager:
    def __init__(self, canvas, width, height):
        self.canvas = canvas
        self.width = width
        self.height = height
        self.symmetry_manager = SymmetryManager(width, height)
        self.image = Image.new("RGB", (self.width, self.height), 'white')
        self.draw = ImageDraw.Draw(self.image)
        self.strokes = []
        self.current_stroke = []
        self.line_width = 1
        self.color = 'black'
        self.old_x = None
        self.old_y = None

    def set_symmetry(self, symmetry):
        self.symmetry_manager.set_symmetry(symmetry)

    def paint(self, x, y):
        if self.old_x is not None and self.old_y is not None:
            points = self.symmetry_manager.calculate_rotated_points(x, y, self.old_x, self.old_y)
            for point in points:
                self.canvas.create_line(point, width=self.line_width, fill=self.color,
                                        capstyle=tk.ROUND, smooth=tk.TRUE, splinesteps=36)
                self.current_stroke.append(point)

        self.old_x, self.old_y = x, y

    def record_stroke(self):
        if self.current_stroke:
            self.strokes.append(self.current_stroke)
            self.current_stroke = []
            self.reset()

    def reset(self):
        self.old_x = None
        self.old_y = None

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

    def set_color(self, new_color):
        self.color = new_color

class DrawingApp:
    def __init__(self, root, width=800, height=600):
        self.root = root
        self.canvas_width = width
        self.canvas_height = height

        main_frame = tk.Frame(self.root)
        main_frame.pack(side=tk.LEFT, padx=10, pady=10)

        control_frame = tk.Frame(main_frame)
        control_frame.pack(side=tk.LEFT, padx=5, pady=5)

        self.canvas = tk.Canvas(main_frame, bg='white', width=self.canvas_width, height=self.canvas_height)
        self.canvas.pack(side=tk.RIGHT, padx=10, pady=10)
        self.canvas_manager = CanvasManager(self.canvas, self.canvas_width, self.canvas_height)

        self.add_controls(control_frame)
        self.setup_bindings()

    def setup_bindings(self):
        self.canvas.bind('<B1-Motion>', self.on_paint)
        self.canvas.bind('<ButtonRelease-1>', self.on_release)
        self.canvas.bind("<MouseWheel>", self.on_mouse_wheel)  # For Windows and MacOS
        self.canvas.bind("<Button-4>", self.on_mouse_wheel)    # For Linux (Scroll Up)
        self.canvas.bind("<Button-5>", self.on_mouse_wheel)    # For Linux (Scroll Down)

    def add_controls(self, control_frame):
        tk.Button(control_frame, text='Set Symmetry', command=self.set_symmetry).pack(side=tk.TOP, pady=5)
        tk.Button(control_frame, text='Undo', command=self.canvas_manager.undo).pack(side=tk.TOP, pady=5)
        tk.Button(control_frame, text='Zoom In', command=lambda: self.zoom(1.1)).pack(side=tk.TOP, pady=5)
        tk.Button(control_frame, text='Zoom Out', command=lambda: self.zoom(0.9)).pack(side=tk.TOP, pady=5)

        self.line_width_slider = tk.Scale(control_frame, from_=1, to=20, orient=tk.HORIZONTAL, label="Line Width", length=300)
        self.line_width_slider.set(1)
        self.line_width_slider.pack(side=tk.TOP, pady=5)
        self.line_width_slider.bind("<Motion>", self.on_line_width_change)

        tk.Button(control_frame, text='Choose Color', command=self.choose_color).pack(side=tk.TOP, pady=5)

    def on_line_width_change(self, event=None):
        self.canvas_manager.line_width = self.line_width_slider.get()

    def choose_color(self):
        color_code = colorchooser.askcolor(title="Choose color")
        if color_code[1] is not None:
            self.canvas_manager.set_color(color_code[1])

    def on_mouse_wheel(self, event):
        zoom_factor = 0.9 if event.num == 5 or event.delta < 0 else 1.1
        self.zoom(zoom_factor)

    def zoom(self, factor):
        self.canvas.scale("all", self.canvas_width / 2, self.canvas_height / 2, factor, factor)
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))


    def set_symmetry(self):
        symmetry = simpledialog.askinteger("Symmetry", "Enter number of axes:", minvalue=1)
        if symmetry is not None:
            self.canvas_manager.set_symmetry(symmetry)

    def on_paint(self, event):
        self.canvas_manager.paint(event.x, event.y)

    def on_release(self, event):
        self.canvas_manager.record_stroke()

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Symmetrical Drawing App")
    canvas_size = 1800
    app = DrawingApp(root, canvas_size, canvas_size)
    root.mainloop()
