var decFirst, incFirst, decSecond, incSecond;
var a = 37, b = 29;
let draggingHorizontal = false;
let draggingVertical = false;
let draggingCorner = false;

function setup() {
    let canvas = createCanvas(1800, 1800);
    canvas.parent('sketch');
}

function draw() {
    clear();

    aTens = Math.floor(a / 10);
    bTens = Math.floor(b / 10);
    aOnes = a % 10;
    bOnes = b % 10;

    const offsetX = 300;
    const offsetY = 40;

    const gap = 6;

    const tensWidth = 120;
    const onesWidth = 12;

    const tenEndX = offsetX + aTens * tensWidth;
    const tenEndY = offsetY + bTens * tensWidth;

    const totalWidth = aTens * tensWidth + aOnes * onesWidth;
    const totalHeight = bTens * tensWidth + bOnes * onesWidth;

    oneOffsetX = (aOnes * onesWidth) / 2;
    oneOffsetY = (bOnes * onesWidth) / 2;

    const tensCenterX = (tenEndX / 2 + offsetX / 2) - gap / 2;
    const tensCenterY = (tenEndY / 2 + offsetY / 2) - gap / 2;
    const onesCenterX = tenEndX + oneOffsetX;
    const onesCenterY = tenEndY + oneOffsetY;

    if(draggingHorizontal || draggingCorner) {
        let newX = (mouseX - offsetX) / onesWidth;
        a = Math.min(99, Math.max(0, Math.round(newX)));
    }
    if(draggingVertical || draggingCorner) {
        let newY = (mouseY - offsetY) / onesWidth;
        b = Math.min(99, Math.max(0, Math.round(newY)));
    }


    // Hover checks
    const overHundredsBlocks = isHover(offsetX, offsetY, aTens * tensWidth - gap/2, bTens * tensWidth - gap/2);
    const overTenByOnesBlocks = isHover(offsetX, tenEndY - gap/2, aTens * tensWidth - gap/2, bOnes * onesWidth - gap/2);
    const overOneByTensBlocks = isHover(tenEndX - gap/2, offsetY, aOnes * onesWidth - gap/2, bTens * tensWidth - gap/2);
    const overOnesBlocks = isHover(tenEndX - gap/2, tenEndY - gap/2, aOnes * onesWidth - gap/2, bOnes*onesWidth - gap/2);

    const overOnesProduct = isHover(50, 120, 150, 50);
    const overTenByOnesProduct = isHover(50, 171, 150, 50);
    const overOneByTensProduct = isHover(50, 222, 150, 50);
    const overHundredsProduct = isHover(50, 273, 150, 50);

    const overHundreds = overHundredsBlocks || overHundredsProduct;
    const overOnes = overOnesBlocks || overOnesProduct;
    const overTenByOnes = overTenByOnesBlocks || overTenByOnesProduct
    const overOneByTens = overOneByTensBlocks || overOneByTensProduct;

    const overBlocks = overHundredsBlocks || overTenByOnesBlocks || overOneByTensBlocks || overOnesBlocks;
    const overProducts = overHundredsProduct || overTenByOnesProduct || overOneByTensProduct || overOnesProduct;
    const showAll = !(overBlocks || overProducts) || draggingHorizontal || draggingVertical;

    const overATens = (overTenByOnes || overHundreds);
    const overBTens = (overOneByTens || overHundreds);
    const overAOnes = (overOneByTens || overOnes);
    const overBOnes = (overTenByOnes || overOnes);

    const aColors = [
        (showAll || overATens) ? "#eb3b5a" : "#222222",
        (showAll || overAOnes) ? "#20bf6b" : "#222222",
    ];
    const bColors = [
        (showAll || overBTens) ? "#3867d6" : "#222222",
        (showAll || overBOnes) ? "#f7b731" : "#222222",
    ];
    const mixColors = [
        (showAll || overHundreds) ? "#8854d0" : "#222222",
        (showAll || overTenByOnes) ? "#fa8231" : "#222222",
        (showAll || overOneByTens) ? "#0fb9b1" : "#222222",
        (showAll || overOnes) ? "#2d98da" : "#222222",
    ];

    noStroke();
    textSize(30);
    textAlign(CENTER, CENTER);
    // Draw tens
    fill(aColors[0]);
    text(aTens * 10, tensCenterX, offsetY - 20);

    fill(bColors[0]);
    text(bTens * 10, offsetX - 25, tensCenterY);

    // Side multiplier
    fill(color(255));
    textSize(48);
    textAlign(RIGHT, RIGHT);
    fill(aColors[0]);
    text(aTens, 130, 50);
    fill(aColors[1]);
    text(aOnes, 160, 50);
    fill(bColors[0]);
    text(bTens, 130, 95);
    fill(bColors[1]);
    text(bOnes, 160, 95);
    fill(color(255));
    text('×', 80, 95);
    stroke(255); strokeWeight(4);
    line(50, 120, 200, 120);
    noStroke();

    fill(mixColors[3]);
    text(aOnes * bOnes, 165, 150);
    fill(mixColors[2]);
    text(aOnes * bTens * 10, 165, 250);
    fill(mixColors[1]);
    text(aTens * bOnes * 10, 165, 200);
    fill(mixColors[0]);
    text(aTens * bTens * 100, 165, 300);

    stroke(255); strokeWeight(4);
    line(50, 325, 200, 325);
    noStroke();

    fill(color(255));
    text(a * b, 165, 360);

    textAlign(CENTER, CENTER);
    textSize(30);

    // Draw plusses
    fill(color(255));
    text('+', Math.max(tenEndX, 100) + 2* gap, offsetY - 20);
    text('+', offsetX - 25, Math.max(tenEndY, 65) - gap);

    // Ones
    const aOnesX = Math.max(tenEndX, 50) + Math.max(oneOffsetX, 30);
    const bOnesY = Math.max(tenEndY, 50) + Math.max(oneOffsetY, 30);
    fill(aColors[1]);
    text(aOnes, aOnesX, offsetY - 20);
    fill(bColors[1]);
    text(bOnes, offsetX - 25, bOnesY);

    // Drag handles
    fill(255);
    drawChevron(offsetX + totalWidth + gap * 2, offsetY + totalHeight / 2, 0);
    drawChevron(offsetX + totalWidth / 2, offsetY + totalHeight + 2 * gap, PI / 2);
    drawChevron(offsetX + totalWidth + gap, offsetY + totalHeight + gap, 1 * PI / 4);

    const horizHandleHover = isHover(offsetX + totalWidth, offsetY + totalHeight / 2 - 90, 30, 180);
    const vertHandleHover = isHover(offsetX + totalWidth / 2 - 90, offsetY + totalHeight, 180, 30);
    const cornerHandleHover = isHover(offsetX + totalWidth + gap - 20, offsetY + totalHeight + gap - 20, 50, 50);

    if(draggingHorizontal) {
        if(!mouseIsPressed) {
            draggingHorizontal = false;
        }
    } else {
        if(horizHandleHover && mouseIsPressed && mouseButton === LEFT) {
            draggingHorizontal = true;
        }
    }

    if(draggingVertical) {
        if(!mouseIsPressed) {
            draggingVertical = false;
        }
    } else {
        if(vertHandleHover && mouseIsPressed && mouseButton === LEFT) {
            draggingVertical = true;
        }
    }

    if(draggingCorner) {
        if(!mouseIsPressed) {
            draggingCorner = false;
        }
    } else {
        if(cornerHandleHover && mouseIsPressed && mouseButton === LEFT) {
            draggingCorner = true;
        }
    }

    // Ten by Ten blocks
    fill(mixColors[0]);
    for(let i = 0; i < aTens; i++) {
        for(let j = 0; j < bTens; j++) {
            let x = offsetX + i * tensWidth - gap/2;
            let y = offsetY + j * tensWidth - gap/2;
            rect(x, y, tensWidth - gap/2, tensWidth - gap/2);
        }
    }

    if(aTens >= 1 && bTens >= 1) {
        fill(255, 255, 255, 230);
        ellipse(tensCenterX, tensCenterY, 70, 70);
        fill(mixColors[0]);
        text(aTens * bTens * 100, tensCenterX, tensCenterY);
    }

    // Ten by One blocks
    fill(mixColors[1]);
    for(let i = 0; i < aTens; i++) {
        for(let j = 0; j < bOnes; j++) {
            let x = offsetX + i * tensWidth - gap/2;
            let y = tenEndY + j * onesWidth - gap/2;
            rect(x, y, tensWidth - gap/2, onesWidth - gap/2);
        }
    }

    if(aTens >= 1 && bOnes >= 5) {
        fill(255, 255, 255, 230);
        ellipse(tensCenterX, onesCenterY - 3*gap / 4, 70, 40);
        fill(mixColors[1]);
        text(aTens * bOnes * 10, tensCenterX, onesCenterY - 3*gap / 4);
    }

    // One by Ten blocks
    fill(mixColors[2]);
    for(let i = 0; i < aOnes; i++) {
        for(let j = 0; j < bTens; j++) {
            let x = tenEndX + i * onesWidth - gap/2;
            let y = offsetY + j * tensWidth - gap/2;
            rect(x, y, onesWidth - gap/2, tensWidth - gap/2);
        }
    }

    if(aOnes >= 5 && bTens >= 1) {
        fill(255, 255, 255, 230);
        ellipse(onesCenterX - 3*gap / 4, tensCenterY, 50, 70);
        fill(mixColors[2]);
        text(aOnes * bTens * 10, onesCenterX - 3*gap / 4, tensCenterY);
    }


    // One by One blocks
    fill(mixColors[3]);
    for(let i = 0; i < aOnes; i++) {
        for(let j = 0; j < bOnes; j++) {
            let x = tenEndX + i * onesWidth - gap / 2;
            let y = tenEndY + j * onesWidth - gap / 2;
            rect(x, y, onesWidth - gap / 2, onesWidth - gap / 2)
        }
    }

    if(aOnes >= 5 && bOnes >= 5) {
        fill(255, 255, 255, 230);
        ellipse(onesCenterX - 3*gap / 4, onesCenterY - 3*gap / 4, 50, 50);
        fill(mixColors[3]);
        text(aOnes * bOnes, onesCenterX - 3*gap/4, onesCenterY - 3*gap/4);
    }
}

function isHover(x, y, w, h) {
    if(x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h) {
        return true;
    }
    return false;
}

function drawChevron(x, y, dir) {
    push();
    rotate(dir);
    translate(cos(-dir)*x - sin(-dir)*y, sin(-dir)*x + cos(-dir)*y);
    beginShape();
    vertex(-10, -15);
    vertex(0, -15);
    vertex(10, 0);
    vertex(0, 15);
    vertex(-10, 15);
    vertex(0, 0);
    endShape(CLOSE);
    pop();
}