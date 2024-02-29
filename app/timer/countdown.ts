class Countdown {
    private static instance: Countdown;
    private countdownTimerId: number | undefined;
    private sumTime: number;
    private remainingTime: number;
    private remainingProgress: number;

    private constructor(private duration: number, private onUpdate: (remainingTime: number, remainingProgress: number) => void, private onComplete: () => void) {
        this.remainingTime = duration;
        this.sumTime = duration;
        this.remainingProgress = 0;
    }

    public static getInstance(duration: number, onUpdate: (remainingTime: number, remainingProgress: number) => void, onComplete: () => void) {
        if (!this.instance) {
            this.instance = new Countdown(duration, onUpdate, onComplete);
        }
        return this.instance
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
};

export default Countdown;

