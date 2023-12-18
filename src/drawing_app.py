import tkinter as tk
from tkinter import simpledialog
from PIL import Image, ImageDraw
import math

class DrawingApp:
    def __init__(self, root):
        self.root = root
        self.canvas = tk.Canvas(root, bg='white', width=800, height=600)
        self.canvas.pack(padx=10, pady=10)

        self.image = Image.new("RGB", (800, 600), 'white')
        self.draw = ImageDraw.Draw(self.image)

        self.setup()
        self.add_controls()

    def setup(self):
        self.old_x = None
        self.old_y = None
        self.line_width = 1
        self.color = 'black'
        self.symmetry = 4  # Default number of symmetry axes
        self.strokes = []  # List to store strokes
        self.current_stroke = []  # Temporary storage for the current stroke
        self.canvas.bind('<ButtonRelease-1>', self.record_stroke)  # Only one binding is needed


        self.canvas.bind('<B1-Motion>', self.paint)
        # self.canvas.bind('<ButtonRelease-1>', self.reset)

    def add_controls(self):
        symmetry_button = tk.Button(self.root, text='Set Symmetry', command=self.set_symmetry)
        symmetry_button.pack(side=tk.TOP, pady=5)
        undo_button = tk.Button(self.root, text='Undo', command=self.undo)
        undo_button.pack(side=tk.TOP, pady=5)

    def set_symmetry(self):
        try:
            self.symmetry = simpledialog.askinteger("Symmetry", "Enter number of axes:", minvalue=1, maxvalue=36)
        except TypeError:
            pass  # User cancelled the dialog; do nothing

    def paint(self, event):
        x, y = event.x, event.y
        if self.old_x and self.old_y:
            for i in range(self.symmetry):
                angle = (2 * math.pi / self.symmetry) * i
                x_rotated, y_rotated = self.rotate_point(x, y, angle)
                x_old_rotated, y_old_rotated = self.rotate_point(self.old_x, self.old_y, angle)
                self.canvas.create_line((x_rotated, y_rotated, x_old_rotated, y_old_rotated),
                                        width=self.line_width, fill=self.color,
                                        capstyle=tk.ROUND, smooth=tk.TRUE, splinesteps=36)
                # Store line in current stroke
                self.current_stroke.append((x_rotated, y_rotated, x_old_rotated, y_old_rotated))

        self.old_x = x
        self.old_y = y

    def record_stroke(self, event):
        if self.current_stroke:
            self.strokes.append(self.current_stroke)
            self.current_stroke = []  # Reset current stroke
        self.reset(event)  # Reset the old_x and old_y

    def reset(self, event):
        self.old_x = None
        self.old_y = None

    def rotate_point(self, x, y, angle):
        # Rotating a point around the center of the canvas
        cx, cy = 800 / 2, 600 / 2
        x -= cx
        y -= cy
        new_x = x * math.cos(angle) - y * math.sin(angle)
        new_y = x * math.sin(angle) + y * math.cos(angle)
        return new_x + cx, new_y + cy

    
    def undo(self):
        if self.strokes:
            self.strokes.pop()  # Remove the last grouped stroke
            print("Undo performed, remaining strokes:", len(self.strokes))  # Debug print
            self.redraw_canvas()

    def redraw_canvas(self):
        self.canvas.delete("all")  # Clear the canvas
        self.image = Image.new("RGB", (800, 600), 'white')  # Reset the image
        self.draw = ImageDraw.Draw(self.image)  # Reset the draw object

        for stroke in self.strokes:
            for line in stroke:
                # Redraw each line in the stroke
                self.canvas.create_line(line, width=self.line_width, fill=self.color, capstyle=tk.ROUND, smooth=tk.TRUE, splinesteps=36)
                self.draw.line(line, fill=self.color, width=self.line_width)  # Redraw on PIL image



if __name__ == '__main__':
    root = tk.Tk()
    root.title("Symmetrical Drawing App")
    app = DrawingApp(root)
    root.mainloop()
