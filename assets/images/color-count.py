import png



reader = png.Reader("Tileset.png")
myPng = reader.read()

pixels = list(myPng[2])

colors = []

for row in pixels:
	for j in range(0, len(row), 4):
		color = str(row[j]) + "," + str(row[j + 1]) + "," + str(row[j + 2]) + "," + str(row[j + 3])
		if not color in colors:
			colors.append(color)

print("Counting Colors: " + str(len(colors)))

#print(colors)

