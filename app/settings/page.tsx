"use client"


import React from 'react';
import { Button, Flex, InputNumber } from 'antd';
import { Config } from '../config';




export default function Settings() {

    const save = async () => {
        await Config.save();
    };
    return (
        <Flex gap="middle" justify='center' align='center'>
            <InputNumber min={1} defaultValue={45} onChange={(value) => Config.set("focusTime", value)} />
            <Button onClick={save}>save</Button>
        </Flex>
    )
}