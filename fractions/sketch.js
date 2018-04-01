'use strict';

let left, right, soln;
let anyHover = () => left.anyHover() || right.anyHover() || soln.anyHover();
let interacHover = () => left.anyHover() || right.anyHover();
let anyDrag = () => left.anyDrag() || right.anyDrag();

function sharedColor(c, cond) {
    return (!anyHover() || cond) ? c : "#222222";
}

function setup() {
    const { w, h } = computeWH();
    let canvas = createCanvas(w, h);
    canvas.parent('sketch');

    let center = w / 2;

    left = new Fraction(1, 3, true, {
        numeratorColor: (t) => sharedColor("#f1c40f", t.numeratorHover),
        denominatorColor: (t) => sharedColor("#e74c3c", t.denominatorHover),
    });
    right = new Fraction(2, 5, true, {
        numeratorColor: (t) => sharedColor("#3498db", t.numeratorHover),
        denominatorColor: (t) => sharedColor("#2ecc71", t.denominatorHover),
    });
    soln = new Fraction(3, 15, false, {
        numeratorColor: (t) => sharedColor("#8e44ad", t.numeratorHover),
        denominatorColor: (t) => sharedColor("#7f8c8d", t.denominatorHover),
    });

    windowResized();
}

class Fraction {
    constructor(n, d, draggable, colorFns) {
        this.x = 0;
        this.y = 0;
        this.fontSize = 120;
        this.numerator = n;
        this.denominator = d;
        this.draggable = draggable;
        this.direction = "vertical";
        this.numeratorHover = false;
        this.numeratorDrag = false;
        this.denominatorHover = false;
        this.denominatorDrag = false;
        this.forceHover = false;
        this.numeratorColor = colorFns.numeratorColor;
        this.denominatorColor = colorFns.denominatorColor;
        this.anyHover = this.anyHover.bind(this);
        this.anyDrag = this.anyDrag.bind(this);
        this.draw = this.draw.bind(this);
        this.width = this.width.bind(this);
        this.height = this.height.bind(this);
    }

    anyDrag() { return this.numeratorDrag || this.denominatorDrag };
    anyHover() { return this.numeratorHover || this.denominatorHover || this.forceHover };

    draw() {
        push();
        fill(255,255,255);
        textSize(this.fontSIze);
        textAlign(CENTER, CENTER);
    
        let {x, y} = this;
        const tw = this.width();
        const hw = tw / 2;
        const th = this.height() / 2;
        const hh = th / 2;

        if(this.draggable) {
            for(let ySign = -1; ySign <= 1; ySign += 2) {
                if(ySign == -1 && this.numeratorDrag) {
                    fill(this.numeratorColor(this));
                } else if(ySign == 1 && this.denominatorDrag) {
                    fill(this.denominatorColor(this));
                } else {
                    fill(100, 100, 100);
                }
                const chevronOffset = tw + 20;
                if(this.direction === "horizontal") {
                    // LEFT
                    triangle(
                        x - (chevronOffset / 2),     y + ySign * (3 * th / 4),
                        x - (chevronOffset / 2),     y + ySign * (th / 4),
                        x - (3 * chevronOffset / 4), y + ySign * (th / 2)
                    );
                    // RIGHT
                    triangle(
                        x + (chevronOffset / 2),     y + ySign * (3 * th / 4),
                        x + (chevronOffset / 2),     y + ySign * (th / 4),
                        x + (3 * chevronOffset / 4), y + ySign * (th / 2)
                    );
                } else {
                    // UP
                    triangle(
                        x - (chevronOffset / 2),     y + ySign * (th / 2),
                        x - chevronOffset,           y + ySign * (th / 2),
                        x - (3 * chevronOffset / 4), y + ySign * (th / 4)
                    );
                    // DOWN
                    triangle(
                        x + (chevronOffset / 2),     y + ySign * (th / 2),
                        x + chevronOffset,           y + ySign * (th / 2),
                        x + (3 * chevronOffset / 4), y + ySign * (3 * th / 4)
                    );
                }
            }
        }
    
        fill(this.numeratorColor(this));
        text(this.numerator, x, y - (th / 2));
        fill(this.denominatorColor(this));
        text(this.denominator, x, y + (th / 2));
    
        strokeWeight(10); stroke(255);
        line(x-(tw / 2), y, x+(tw/2), y);
        pop();
    }

    update() {
        let {x, y} = this;
        const tw = this.width();
        const hw = tw / 2;
        const th = this.height() / 2;
        const hh = th / 2;
        if(this.numeratorDrag) {
            if(!mouseIsPressed) {
                this.numeratorDrag = false;
            } else {
                const delta = this.dragStartDir === "horizontal" ? (mouseX - this.dragStartX) : (mouseY - this.dragStartY);
                const range = this.dragStartDir === "horizontal" ? window.innerWidth : 300;
                const steps = Math.round((2 * delta / range) * this.denominator);
                this.numerator = clamp(this.dragStartNum + steps, 0, this.denominator);
            }
        } else if(this.denominatorDrag) {
            if(!mouseIsPressed) {
                this.denominatorDrag = false;
            } else {
                const delta = this.dragStartDir === "horizontal" ? (mouseX - this.dragStartX) : (mouseY - this.dragStartY);
                const range = this.dragStartDir === "horizontal" ? window.innerWidth : 300;
                const steps = Math.round((2 * delta / range) * 9);
                this.denominator = clamp(this.dragStartDenom + steps, 1, 15);
                this.numerator = clamp(this.numerator, 1, this.denominator);
            }
        }
        if(!anyDrag()) {
            this.numeratorHover = interactiveRegion(x - hw, y - th, tw, th);
            if(this.draggable && this.numeratorHover && mouseIsPressed) {
                this.numeratorDrag = true;
                this.dragStartNum = this.numerator;
                this.dragStartDir = this.direction;
                this.dragStartX = mouseX;
                this.dragStartY = mouseY;
            }
            this.denominatorHover = interactiveRegion(x - hw, y, tw, th);
            if(this.draggable && this.denominatorHover && mouseIsPressed) {
                this.denominatorDrag = true;
                this.dragStartDenom = this.denominator;
                this.dragStartDir = this.direction;
                this.dragStartX = mouseX;
                this.dragStartY = mouseY;
            }
            this.numeratorHover = this.anyHover();
            this.denominatorHover = this.anyHover();
            this.forceHover = false;
        }
    }

    width() {
        push();
        textSize(this.fontSize);
        const nw = textWidth(str(this.numerator));
        const dw = textWidth(str(this.denominator));
        pop();
        return Math.max(nw, dw);
    }

    height() {
        push();
        textSize(this.fontSize);
        const h = textWidth('99')
        pop();
        return 2 * h;
    }
}

let debug = false;

function computeWH() {
    let w = window.innerWidth;
    let h = window.innerHeight - 10;
    return { w, h };
}

function windowResized() {
    const { w, h } = computeWH();
    resizeCanvas(w, h);

    const third = w / 4; // evenly distribute 4 things, counting the edge of the screen
    left.x = third;
    left.y = 300 / 2;
    right.x = third * 2;
    right.y = 300 / 2;
    soln.x = third * 3 + 40; // Give more space for soln, since it can be 3 digits
    soln.y = 300 / 2;
}

function draw() {
    soln.numerator = left.numerator * right.numerator;
    soln.denominator = left.denominator * right.denominator;

    if(anyDrag()) {
        noCursor();
    } else if(interacHover()) {
        cursor(HAND);
    } else {
        cursor();
    }

    clear();
    fill(255,255,255);
    textSize(120);
    textAlign(CENTER, CENTER);
    
    left.update();
    right.update();
    soln.update();

    renderBox();

    // Draw multiplications
    let center = width / 2;
    left.draw();
    text('×', (left.x + right.x) / 2, 300 / 2);
    right.draw();
    text('=', (right.x + soln.x) / 2, 300 / 2);
    soln.draw();
}


const gap = 30;
let currentHGap = gap, currentVGap = gap;
let targetHGap = currentHGap, targetVGap = currentVGap;

const stripeWidth = 70, stripeGap = 70;
let solnStripeWidth = stripeWidth, targetSolnStripeWidth = stripeWidth;
let horizStripeWidth = stripeWidth, targetHorizStripeWidth = stripeWidth;
let vertStripeWidth = stripeWidth, targetVertStripeWidth = stripeWidth;


function renderBox() {
    push();
    const horizontalMargin = 20;
    const verticalMargin = 20;
    const leftBorder = horizontalMargin;
    const rectWidth = width - 2*horizontalMargin;
    const topBorder = 300 + verticalMargin;
    const rectHeight = height - topBorder - verticalMargin;

    const horizFrac = left; // (width > height === left.denominator > right.denominator) ? left : right;
    const vertFrac  = right; // (width > height === left.denominator > right.denominator) ? right: left;

    horizFrac.direction = "horizontal";
    vertFrac.direction = "vertical";

    const horizSlices = horizFrac.denominator;
    const horizSliceWidth = rectWidth / horizSlices;
    const vertSlices = vertFrac.denominator;
    const vertSliceHeight = rectHeight / vertSlices;

    targetHorizStripeWidth = stripeWidth;
    targetVertStripeWidth = stripeWidth;
    targetSolnStripeWidth = stripeWidth;
    
    let primaryColor = soln.denominatorColor({ denominatorHover: true });

    noStroke();

    if(horizFrac.anyDrag() || horizFrac.anyHover()) {
        primaryColor = horizFrac.denominatorColor({ denominatorHover: true });
        targetHorizStripeWidth = stripeWidth;
        targetSolnStripeWidth = 0;
        targetVertStripeWidth = 0;
    }
    if(vertFrac.anyDrag() || vertFrac.anyHover()) {
        primaryColor = vertFrac.denominatorColor({ denominatorHover: true });
        targetVertStripeWidth = stripeWidth;
        targetSolnStripeWidth = 0;
        targetHorizStripeWidth = 0;
    }

    targetHGap = gap;
    targetVGap = gap;

    if(!anyDrag()) {
        if(soln.anyHover()) {
            targetSolnStripeWidth = stripeWidth;
            targetHorizStripeWidth = 0;
            targetVertStripeWidth = 0;
        }
        if(horizFrac.anyHover()) {
            targetVGap = 0;
        }
        if(vertFrac.anyHover()) {
            targetHGap = 0;
        }
    }

    if(!anyDrag()) {
        if(isHover(
            leftBorder, topBorder, 
            horizSliceWidth * horizFrac.numerator - currentHGap, vertSliceHeight * vertFrac.numerator - currentVGap
        )) {
            soln.forceHover = true;
            targetSolnStripeWidth = stripeWidth;
            targetHorizStripeWidth = 0;
            targetVertStripeWidth = 0;
        }
        if(isHover(
            leftBorder, topBorder + vertSliceHeight * vertFrac.numerator, 
            horizSliceWidth * horizFrac.numerator - currentHGap, vertSliceHeight * (vertFrac.denominator - vertFrac.numerator) - currentVGap
        )) {
            targetVGap = 0;
            primaryColor = horizFrac.denominatorColor({ denominatorHover: true });
            horizFrac.forceHover = true;
            targetSolnStripeWidth = 0;
            targetHorizStripeWidth = stripeWidth;
            targetVertStripeWidth = 0;
        }
        if(isHover(
            leftBorder + horizSliceWidth * horizFrac.numerator, topBorder, 
            horizSliceWidth * (horizFrac.denominator - horizFrac.numerator) - currentHGap, vertSliceHeight * vertFrac.numerator - currentVGap
        )) {
            targetHGap = 0;
            primaryColor = vertFrac.denominatorColor({ denominatorHover: true });
            vertFrac.forceHover = true;
            targetSolnStripeWidth = 0;
            targetHorizStripeWidth = 0;
            targetVertStripeWidth = stripeWidth;
        }
    }

    fill(primaryColor);
    rect(leftBorder, topBorder, rectWidth, rectHeight);

    let secondaryColor = horizFrac.numeratorColor({ numeratorHover: true });
    fill(secondaryColor);
    stripeRegion(
        leftBorder, topBorder,
        horizSliceWidth * horizFrac.numerator,
        vertSliceHeight * vertFrac.denominator,
        horizStripeWidth, stripeGap + (stripeWidth - horizStripeWidth)
    );

    fill(vertFrac.numeratorColor({ numeratorHover: true }));
    stripeRegion(
        leftBorder, topBorder,
        horizSliceWidth * horizFrac.denominator,
        vertSliceHeight * vertFrac.numerator,
        vertStripeWidth, stripeGap + (stripeWidth - vertStripeWidth)
    );    

    fill(soln.numeratorColor({ numeratorHover: true }));
    stripeRegion(
        leftBorder, topBorder,
        horizSliceWidth * horizFrac.numerator,
        vertSliceHeight * vertFrac.numerator,
        solnStripeWidth, stripeGap + (stripeWidth - solnStripeWidth)
    );

    const animationRate = 12;
    currentHGap = animateTowards(currentHGap, targetHGap, animationRate);
    currentVGap = animateTowards(currentVGap, targetVGap, animationRate);

    solnStripeWidth = animateTowards(solnStripeWidth, targetSolnStripeWidth, animationRate);
    horizStripeWidth = animateTowards(horizStripeWidth, targetHorizStripeWidth, animationRate);
    vertStripeWidth = animateTowards(vertStripeWidth, targetVertStripeWidth, animationRate);
    
    fill("#2c3e50");
    for(let x = 1; x < horizFrac.denominator; x++) {
        let left = leftBorder + x * horizSliceWidth - currentHGap;
        rect(left, topBorder, currentHGap, rectHeight);
    }
    for(let x = 1; x < vertFrac.denominator; x++) {
        let top = topBorder + x * vertSliceHeight - currentVGap;
        rect(leftBorder, top, rectWidth, currentVGap);
    }

    pop();
}

function animateTowards(current, target, speed) {
    if(current < target) {
        return Math.min(current + speed, target);
    } else if(current > target) {
        return Math.max(current - speed, target);
    }
    return current;
}

function stripeRegion(left, top, boxWidth, boxHeight, stripeWidth, stripeGap) {
    const stripeStride = stripeWidth + stripeGap;
    for(let c = 0; c < 100; c++) {
        const stripeAX = Math.min(c * stripeStride, boxWidth);
        const stripeAY = c * stripeStride - stripeAX;

        const stripeBX = Math.min(stripeAX + stripeWidth, boxWidth);
        const stripeBY = c * stripeStride - stripeBX + stripeWidth;

        const stripeCY = Math.min(c * stripeStride, boxHeight);
        const stripeCX = c * stripeStride - stripeCY;

        const stripeDY = Math.min(stripeCY + stripeWidth, boxHeight);
        const stripeDX = c * stripeStride - stripeDY + stripeWidth;

        if(stripeAY > boxHeight || stripeBY > boxHeight || stripeCX > boxWidth || stripeDX > boxWidth) {
            break;
        }
        quad(
            left + stripeAX,
            top + stripeAY,

            left + stripeBX,
            top + stripeBY,

            left + stripeDX,
            top + stripeDY,
            
            left + stripeCX,
            top + stripeCY,
        );

        // Fill in corner triangles
        if(stripeAY !== stripeBY) {
            triangle(
                left + stripeAX,
                top + stripeAY,

                left + boxWidth,
                top,

                left + stripeBX,
                top + stripeBY,
            );
        }
        if(stripeCY !== stripeDY) {
            triangle(
                left + stripeDX,
                top + stripeDY,

                left,
                top + boxHeight,

                left + stripeCX,
                top + stripeCY,
            );
        }
    }
}

function interactiveRegion(x, y, width, height) {
    push();
    const hovered = isHover(x, y, width, height);
    if(debug) {
        hovered ? fill(200, 200, 200, 100) : fill(100, 100, 100, 100);
        rect(x, y, width, height);
    }
    pop();
    return hovered;
}

function isHover(x, y, w, h) {
    if(x <= mouseX && mouseX <= x + w && y <= mouseY && mouseY <= y + h) {
        return true;
    }
    return false;
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}