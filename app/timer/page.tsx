"use client"

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useEffect } from 'react'
import { Button, Flex } from 'antd';
import { invoke } from '@tauri-apps/api/tauri'
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { trace, info, error, attachConsole } from "tauri-plugin-log-api";
import Countdown from './countdown';



// @ts-ignore
const TinyRing = dynamic(() => import('@ant-design/plots').then(({ Tiny }) => Tiny.Ring), { ssr: false })

interface CountdownShow {
    remainingTime: string,
    remainingProgress: number,
}


const Timer: React.FC = () => {

    attachConsole();
    const [state, setState] = useState<Boolean>(false);
    const [timeData, setTimeData] = useState<CountdownShow>({ remainingTime: "45:60", remainingProgress: 1 });

    const tip = async (message: string) => {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        if (permissionGranted) {
            sendNotification({ title: 'tp-app', body: message });
        }
    }


    const countdown = Countdown.getInstance(100, (remainingTime, remainingProgress) => {
        if (remainingTime > 60 * 60) {
            setTimeData({ remainingTime: `${Math.floor(remainingTime / 3600).toString().padStart(2, '0')}:${Math.floor((remainingTime % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(remainingTime % 60).toString().padStart(2, '0')}`, remainingProgress: remainingProgress });
        } else {
            setTimeData({ remainingTime: `${Math.floor(remainingTime / 60).toString().padStart(2, "0")}:${Math.floor(remainingTime % 60).toString().padStart(2, "0")}`, remainingProgress: remainingProgress });
        };
    }, () => {
        setState(false);
        tip("专注时间结束!");
    }
    )


    const startCountdown = () => {
        countdown.start()
        setState(true);
    }

    const stopCountdown = () => {
        countdown.stop()
        setState(false);
    }

    const extendCountdown = () => {
        countdown.reset()
    }

    const config = {
        percent: timeData.remainingProgress,
        color: ['#E8EFF5', '#1677ff'],
        animate: false,
        annotations: [
            {
                type: 'text',
                radius: 0.9,
                style: {
                    text: timeData.remainingTime,
                    x: '50%',
                    y: '50%',
                    textAlign: 'center',
                    fontSize: 50,
                    fontStyle: 'bold',
                },
            },
        ],
    };
    return (
        <Flex gap="middle" justify='center' align='center'>
            <section>
                <TinyRing {...config} />
                <Flex gap="middle" vertical justify='center' align='center'>
                    {state ? (
                        <><Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={extendCountdown}>
                            Extend(5 min)
                        </Button><Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={stopCountdown}>
                                End Focus
                            </Button></>
                    ) : (
                        <Button type="primary" shape="round" size='large' style={{ width: '30%' }} onClick={startCountdown}>
                            Start
                        </Button>
                    )}
                </Flex>
            </section>
        </Flex>
    )
};
export default Timer;