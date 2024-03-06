"use client"

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { Button, Flex } from 'antd';
import { invoke } from '@tauri-apps/api/tauri';
import { trace, info, error, attachConsole } from "tauri-plugin-log-api";
import { tip } from '../notification';
import { Config } from '../config';



// @ts-ignore
const TinyRing = dynamic(() => import('@ant-design/plots').then(({ Tiny }) => Tiny.Ring), { ssr: false })



interface CountdownShow {
    time_remaining: number | string,
    progress_remaining: number,
    is_tip: boolean,
    tip_message: string,
}


function TimerButton({ state, startFunc, stopFunc, extendFunc }: { state: number, startFunc: () => {}, stopFunc: () => {}, extendFunc: () => {} }) {
    if (state == 0) {
        return <Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={startFunc}>
            Start
        </Button>
    } else if (state == 1) {
        return <><Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={extendFunc}>
            Extend(5 min)
        </Button><Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={stopFunc}>
                End Focus
            </Button></>
    } else {
        return <Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={startFunc}>
            Start
        </Button>
    }
};


function TimerRing({ data }: { data: CountdownShow }) {
    const config = {
        percent: data.progress_remaining,
        color: ['#E8EFF5', '#1677ff'],
        animate: false,
        annotations: [
            {
                type: 'text',
                radius: 0.9,
                style: {
                    text: typeof data.time_remaining === "string" ? data.time_remaining : `${data.time_remaining}:00`,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 50,
                    fontStyle: 'bold',
                },
            },
        ],
    };

    return <TinyRing {...config} />

}



export default function Timer() {

    attachConsole();
    const [state, setState] = useState<number>(0);
    const [countdownId, setCountdownId] = useState<number | undefined>(undefined);
    const [timerID, setTimerID] = useState<number | undefined>(undefined);
    const [data, setData] = useState<CountdownShow>({ time_remaining: 45, progress_remaining: 1, is_tip: false, tip_message: "" });

    const initData = async () => Config.get("focusTime").then((focusTime) => {
        setData({ time_remaining: focusTime as number, progress_remaining: 1, is_tip: false, tip_message: "" })
    });


    const startCountdown = async () => invoke<number>('add', { intervalMinute: data.time_remaining }).then((id) => {
        console.log("当前计时器id为:" + id);
        setCountdownId(id);
        setState(1);
    })


    const stopCountdown = async () => invoke<string>('stop', { countdown_id: countdownId }).then(() => {
        clearInterval(timerID);
        initData();
        setState(0);
    })

    const extendCountdown = async () => invoke<string>('extend', { countdown_id: countdownId }).then(() => { setState(1) })


    useEffect(() => {
        if (countdownId != undefined) {
            const intervalId = window.setInterval(() => {
                invoke<CountdownShow>('get_time', { countdown_id: countdownId }).then((respTime) => {
                    setData(respTime);
                    if (respTime.is_tip) {
                        tip(respTime.tip_message);
                    };
                    if (respTime.progress_remaining <= 0) {
                        clearInterval(intervalId);
                        setState(0);
                    }
                })
            }, 1000)
            setTimerID(intervalId);
        }
    }, [countdownId]);

    useEffect(() => {
        initData();
    }, []);

    return (
        <Flex gap="middle" justify='center' align='center'>
            <section>
                <TimerRing
                    data={data} />
                <Flex gap="middle" vertical justify='center' align='center'>
                    <TimerButton
                        state={state}
                        startFunc={startCountdown}
                        stopFunc={stopCountdown}
                        extendFunc={extendCountdown}
                    />
                </Flex>
            </section>
        </Flex>
    )
};