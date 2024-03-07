"use client"
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ClockCircleOutlined, SettingOutlined, PieChartOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Flex, Layout } from 'antd';




const { Content, Sider } = Layout;
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <Layout hasSider>
        <Sider width="50px" theme="light" style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
          <Flex gap="middle" vertical className='w-8 h-max' justify="center" align="center">
            <Avatar shape="square" size="large" src="/app-icon.png" />
            <Button shape="circle" icon={<ClockCircleOutlined />} href='/timer' />
            <Button shape="circle" icon={<PieChartOutlined />} href='/analyse' />
            <Button shape="circle" icon={<SettingOutlined />} href='/settings' />
          </Flex>
        </Sider>
        <Content>
          <AntdRegistry>{children}</AntdRegistry>
        </Content>
      </Layout>
    </body>
  </html>
);

export default RootLayout;