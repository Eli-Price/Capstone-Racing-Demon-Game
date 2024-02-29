import Phaser from 'phaser';

export function createDeckBottom(scene: Phaser.Scene) {
  let graphics = scene.add.graphics();
  drawDeckBottom(graphics, 0, 0, 86, 122, 10, 0xD6D6D6, 1, 2.5);
  graphics.generateTexture('deckBottomTexture', 86, 122);
  graphics.destroy();
  
}

export function drawDeckBottom(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, radius: number, color: number, alpha: number, dotSize: number) {
    drawDottedLine(graphics, x + radius, y, x + width - radius, y, color, alpha, dotSize); // Top
    drawDottedLine(graphics, x, y + radius, x, y + height - radius, color, alpha, dotSize); // Left
    drawDottedLine(graphics, x + width, y + radius, x + width, y + height - radius, color, alpha, dotSize); // Right
    drawDottedLine(graphics, x + radius, y + height, x + width - radius, y + height, color, alpha, dotSize); // Bottom

    drawDottedArc(graphics, x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI, color, alpha, dotSize); // Top-left corner
    drawDottedArc(graphics, x + width - radius, y + radius, radius, 1.5 * Math.PI, 2 * Math.PI, color, alpha, dotSize); // Top-right corner
    drawDottedArc(graphics, x + width - radius, y + height - radius, radius, 0, 0.5 * Math.PI, color, alpha, dotSize); // Bottom-right corner
    drawDottedArc(graphics, x + radius, y + height - radius, radius, 0.5 * Math.PI, Math.PI, color, alpha, dotSize); // Bottom-left corner
}

function drawDottedLine(graphics: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, color: number, alpha: number, dotSize: number) {
    let distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
    let count = distance / (dotSize * 3);
    let dx = (x2 - x1) / count;
    let dy = (y2 - y1) / count;

    for (let i = 0; i < count; i++) {
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(x1 + dx * i, y1 + dy * i, dotSize / 2);
    }
}

function drawDottedArc(graphics: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, startAngle: number, endAngle: number, color: number, alpha: number, dotSize: number) {
    let distance = Math.abs(startAngle - endAngle) * radius;
    let count = distance / (dotSize * 3);
    let dAngle = (endAngle - startAngle) / count;

    for (let i = 0; i < count; i++) {
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(x + radius * Math.cos(startAngle + dAngle * i), y + radius * Math.sin(startAngle + dAngle * i), dotSize / 2);
    }
}