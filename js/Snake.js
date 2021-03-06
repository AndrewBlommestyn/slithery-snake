/*
Copyright 2020 Andrew Blommestyn. All Rights Reserved
andrewblommestyn.com
*/

//class to hold all data related to the snake
class Snake {
    constructor() {
        this.position = { //where the head is now
            x: (width / 2),
            y: (height / 2)
        };

        this.velocity = { //direction it's moving and how fast (velocity)
            direction: width > height ? 0 : Math.PI / 2, //in radians. Start moving where it has the most space (the direction will be mirrored horizontally because of co-ordinate system)
            speed: settings.difficultySettings
        };

        this.rotation = { //direction it's rotating and how fast 
            clockwise: false,
            counterClockwise: false,
            speed: 5 * Math.PI / 180 //absolute angular velocity in radians (make this larger to increase turning speed/lower turning radius)
        };

        this.segments = new SinglyLinkedList(); //holds all the segments of the snake
        this.width = 40; //side of snake
        this.ate = false; //if it ate

        this.setEatTime(350); //start the snake off at a given length
    }

    //sets time the snake will grow
    setEatTime(miliseconds) {
        this.ate = true;
        setTimeout(() => {
            this.ate = false;
        }, miliseconds);
    }

    //checks if the next update will result in a collision
    checkHit() {
        //for when the snake hits itself
        for (let i = this.velocity.direction - Math.PI / 2; i <= this.velocity.direction + Math.PI / 2; i += 10 * Math.PI / 180) { //for loop that gets the color data directly infront of the snake
            //position of hitbox (semi-circle arround head)
            const imageX = this.position.x + Math.cos(i) * (this.width / 2 + 2);
            const imageY = this.position.y + Math.sin(i) * (this.width / 2 + 2);

            const point = ctx.getImageData(imageX, imageY, 1, 1).data; //holds color data for the hitbox pixel

            //checks if the color is the same as the snake
            if (settings.darkThemeSettings) {
                if (point[0] == 255 && point[1] == 255 && point[2] == 255 && point[3] == 255) { //color info for black pixel (RGBA)
                    return true;
                }
            } else {
                if (point[0] == 0 && point[1] == 0 && point[2] == 0 && point[3] == 255) { //color info for black pixel (RGBA)
                    return true;
                }
            }
        }

        //for when the snake hits the walls
        if (this.position.x - this.width / 2 < 0 || this.position.x + this.width / 2 > width || this.position.y - this.width / 2 < 0 || this.position.y + this.width / 2 > height) {
            return true;
        }

        //reaches this point if there is no closiions
        return false;
    }

    //updates snakes position
    update(progress) {
        //adds rotational velocity to the direction of the translational velocity (makes it rotate)
        this.velocity.direction += progress * (this.rotation.clockwise || -this.rotation.counterClockwise) * this.rotation.speed;

        //update the position by adding the velocity of each component direction
        this.position.x += progress * Math.cos(this.velocity.direction) * this.velocity.speed;
        this.position.y += progress * Math.sin(this.velocity.direction) * this.velocity.speed;

        //checks if an apple was eaten
        if (apple.isEaten()) {
            score++;
            this.setEatTime(350);
            apple = new Apple();
        }
    }

    //draws the snake
    draw(color) {
        const headPoint = new Point(this.position.x, this.position.y); //the location of the head

        if (this.segments.length == 0) { //makes sure snake isn't empty
            this.segments.add(headPoint);
        } else if (this.segments.tail.element.distanceSquared(headPoint) >= -settings.graphicsSettings) { //draws it only if the new point is a certain distance away. This is the graphics setting
            this.segments.add(headPoint); //new segment at the head

            if (!snake.ate) { //when you ate don't remove last segment
                this.segments.removeFirst();
            }
        }

        ctx.beginPath();

        //shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";

        if (settings.shadowsSettings) { //if you want to draw shadows
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 10;
        } else { //if you don't want shadows
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }

        //stroke styles
        ctx.strokeStyle = color;
        ctx.lineWidth = this.width;
        ctx.lineCap = "round";
        // ctx.moveTo(this.segments.head.element.x, this.segments.head.element.y); //maybe not needed?

        //connect all the segments
        for (let segment of this.segments) {
            ctx.lineTo(segment.x, segment.y);
        }
        ctx.lineTo(this.position.x, this.position.y); //this is for lower graphics settings to make it smoother at the head
        ctx.stroke(); //draw it
    }
}
