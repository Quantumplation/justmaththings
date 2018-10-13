'use strict';

let left;
let anyHover = () => left.anyHover();
let interacHover = () => left.anyHover();
let anyDrag = () => left.anyDrag();

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
        denominatorColor: (t) => sharedColor("#c0392b", t.denominatorHover),
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
        this.direction = "horizontal";
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
                const range = this.dragStartDir === "horizontal" ? window.innerWidth / 2 : 300;
                const steps = Math.round((2 * delta / range) * this.denominator);
                this.numerator = clamp(this.dragStartNum + steps, -10, 10);
            }
        } else if(this.denominatorDrag) {
            if(!mouseIsPressed) {
                this.denominatorDrag = false;
            } else {
                const delta = this.dragStartDir === "horizontal" ? (mouseX - this.dragStartX) : (mouseY - this.dragStartY);
                const range = this.dragStartDir === "horizontal" ? window.innerWidth / 2 : 300;
                const steps = Math.round((2 * delta / range) * 9);
                this.denominator = clamp(this.dragStartDenom + steps, -10, 10);
                this.numerator = clamp(this.numerator, -10, 10);
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
}

function draw() {
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
    
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;
    let strideX = window.innerWidth / 20;
    let strideY = strideX;

    let slope = (left.numerator * strideY) / (left.denominator * strideX);

    let intercept = 0;
    let runStartX = originX;
    let runStartY = originY - intercept * strideY;
    let runEndX = runStartX + left.denominator * strideX;
    let runEndY = runStartY;

    let riseStartX = runEndX;
    let riseStartY = runEndY;
    let riseEndX = riseStartX;
    let riseEndY = riseStartY - left.numerator * strideY;

    // draw axis
    push();
    strokeWeight(5); stroke(255);
    line(originX, 0, originX, window.innerHeight);
    line(0, originY, window.innerWidth, originY);

    // draw run
    stroke(left.denominatorColor(left));
    line(runStartX, runStartY, runEndX, runEndY);

    // draw rise
    stroke(left.numeratorColor(left));
    line(riseStartX, riseStartY, riseEndX, riseEndY);

    stroke('#3498db');
    let length = 1000;
    line(runStartX - length, runStartY + length * slope, runStartX + length, runStartY - length * slope);

    pop();
    // Draw multiplications
    left.draw();
}


function animateTowards(current, target, speed) {
    if(current < target) {
        return Math.min(current + speed, target);
    } else if(current > target) {
        return Math.max(current - speed, target);
    }
    return current;
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