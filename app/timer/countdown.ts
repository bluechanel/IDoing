export class Countdown {
    private countdownTimerId: number | undefined;
    private sumTime: number;
    private remainingTime: number;
    private remainingProgress: number;

    constructor(private duration: number, private onUpdate: (remainingTime: number, remainingProgress: number) => void, private onComplete: () => void) {
        this.remainingTime = duration;
        this.sumTime = duration;
        this.remainingProgress = 0;
    }


    start() {
        if (this.countdownTimerId !== undefined) return; // 防止重复启动

        this.countdownTimerId = window.setInterval(() => {
            this.remainingTime--;
            this.remainingProgress = this.remainingTime / this.sumTime;
            this.onUpdate(this.remainingTime, this.remainingProgress);

            if (this.remainingTime <= 0) {
                this.stop();
                this.onComplete();
            }
        }, 1000);
    }

    stop() {
        if (this.countdownTimerId !== undefined) {
            clearInterval(this.countdownTimerId);
            this.countdownTimerId = undefined;
        }
    }

    reset(duration: number = this.duration) {
        this.stop();
        this.remainingTime = duration;
    }

    extend(extendDuration: number) {
        this.remainingTime = this.remainingTime + extendDuration;
        this.sumTime = this.sumTime + extendDuration;
    }
}

