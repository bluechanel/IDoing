"use client"

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useEffect } from 'react'
import { Button, Flex } from 'antd';
import { invoke } from '@tauri-apps/api/tauri'

// @ts-ignore
const TinyRing = dynamic(() => import('@ant-design/plots').then(({ Tiny }) => Tiny.Ring), { ssr: false })


const Time: React.FC = () => {

    const [data, setData] = useState("45:60");
    const [state, setState] = useState(Boolean);
    const [countdownId, setcountdownId] = useState(0);


    const fetchData = async () => {
        console.log("当前查询的计时id为：" + countdownId);
        const respTime = await invoke<string>('get_time', { countdown_id: countdownId });
        setData(respTime);
    }

    const startCountdown = async () => {
        const id = await invoke<number>('add');
        setcountdownId(id);
        console.log("新建计时id为：" + id);
        setState(true);
    }

    const stopCountdown = async () => {
        await invoke<string>('stop', { countdown_id: countdownId });
        setcountdownId(0);
        setState(false);
    }

    const extendCountdown = async () => {
        await invoke<string>('extend', { countdown_id: countdownId });
        setState(true);
    }

    useEffect(() => {
        // 设置轮询间隔
        if (countdownId > 0) {
            const intervalId = setInterval(fetchData, 1000); // 每秒轮询一次
            return () => clearInterval(intervalId);
        }
    }, [countdownId]); // 空依赖数组确保定时器只在组件加载时设置一次

    const config = {
        percent: 0.7,
        color: ['#E8EFF5', '#1677ff'],
        annotations: [
            {
                type: 'text',
                radius: 0.9,
                style: {
                    text: data,
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
export default Time;