"use client"
import React, { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ClockCircleOutlined, SettingOutlined, PieChartOutlined } from '@ant-design/icons';
import { Avatar, Button, ConfigProvider, Flex, Layout, Switch, theme } from 'antd';





export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState(() => theme.darkAlgorithm);

  const { Content, Sider } = Layout;
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{ algorithm: themeColor }}>
          <Layout hasSider>
            <Sider width="50px" style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
              <Flex gap="middle" vertical justify="center" align="center">
                <Avatar shape="square" size="large" src="/app-icon.png" />
                <Button shape="circle" icon={<ClockCircleOutlined />} href='/timer' />
                <Button shape="circle" icon={<PieChartOutlined />} href='/analyse' />
                <Button shape="circle" icon={<SettingOutlined />} href='/settings' />
                <Switch size="small" defaultChecked onChange={(checked) => {
                  if (checked) {
                    setThemeColor(() => { return theme.darkAlgorithm; })
                  } else {
                    setThemeColor(() => { return theme.defaultAlgorithm; })
                  }
                }} />
              </Flex>
            </Sider>
            <Content>
              <AntdRegistry>{children}</AntdRegistry>
            </Content>
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  )
};
