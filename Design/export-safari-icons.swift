// Run from the project root: swift Design/export-safari-icons.swift
// Exports the existing Icon Composer design; does not modify App Icon.icon.
import AppKit

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let document = root.appendingPathComponent("App Icon.icon")
let output = root.appendingPathComponent("Shared (Extension)/Resources/images")
let temporary = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
try FileManager.default.createDirectory(at: temporary, withIntermediateDirectories: true)
defer { try? FileManager.default.removeItem(at: temporary) }

let export = temporary.appendingPathComponent("icon.png")
let process = Process()
process.executableURL = URL(fileURLWithPath: "/Applications/Xcode.app/Contents/Applications/Icon Composer.app/Contents/Executables/ictool")
process.arguments = [document.path, "--export-image", "--output-file", export.path,
                     "--platform", "iOS", "--rendition", "Default",
                     "--width", "1024", "--height", "1024", "--scale", "1"]
try process.run()
process.waitUntilExit()
guard process.terminationStatus == 0, let appIcon = NSImage(contentsOf: export) else {
    fatalError("Icon Composer export failed")
}

func writePNG(_ image: NSImage, size: Int, to url: URL, padding: CGFloat = 0) throws {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
                                 bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                                 isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    bitmap.size = NSSize(width: size, height: size)
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    NSGraphicsContext.current?.imageInterpolation = .high
    let side = CGFloat(size) * (1 - 2 * padding)
    let ratio = min(side / image.size.width, side / image.size.height)
    let width = image.size.width * ratio
    let height = image.size.height * ratio
    image.draw(in: NSRect(x: (CGFloat(size) - width) / 2, y: (CGFloat(size) - height) / 2,
                          width: width, height: height))
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using: .png, properties: [:])!.write(to: url)
}

for size in [48, 64, 96, 128, 256, 512] {
    try writePNG(appIcon, size: size, to: output.appendingPathComponent("icon-\(size).png"))
}
try writePNG(appIcon, size: 512, to: root.appendingPathComponent("Shared (App)/Resources/Icon.png"))

// Use the original layer's alpha silhouette for Safari's template toolbar icon.
// Crop empty space automatically, preserving the user's exact S shape.
let source = document.appendingPathComponent("Assets/IMG_7934 Kopie.png")
let layer = NSBitmapImageRep(data: try Data(contentsOf: source))!
var minX = layer.pixelsWide, minY = layer.pixelsHigh, maxX = 0, maxY = 0
for y in 0..<layer.pixelsHigh {
    for x in 0..<layer.pixelsWide {
        if layer.colorAt(x: x, y: y)!.alphaComponent > 0.05 {
            minX = min(minX, x); maxX = max(maxX, x)
            minY = min(minY, y); maxY = max(maxY, y)
        }
    }
}
let bounds = CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
let cropped = NSBitmapImageRep(cgImage: layer.cgImage!.cropping(to: bounds)!)
for y in 0..<cropped.pixelsHigh {
    for x in 0..<cropped.pixelsWide {
        let alpha = cropped.colorAt(x: x, y: y)!.alphaComponent
        cropped.setColor(NSColor(deviceWhite: 0, alpha: alpha), atX: x, y: y)
    }
}
let mark = NSImage(cgImage: cropped.cgImage!, size: bounds.size)
for size in [16, 32, 48, 64, 96, 128] {
    try writePNG(mark, size: size, to: output.appendingPathComponent("toolbar-icon-\(size).png"), padding: 0.08)
}
print("Exported Safari icons from App Icon.icon.")
