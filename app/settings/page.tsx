"use client"


import React from 'react';
import { Button, Flex } from 'antd';




const Setting: React.FC = () => {
    return (
        <Flex gap="middle" justify='center' align='center'>
            <Button type="primary" shape="round" size='large' style={{ width: '30%' }}>
                todo
            </Button>
        </Flex>
    )
};
export default Setting;