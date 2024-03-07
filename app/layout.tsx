"use client"
import React, { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ClockCircleOutlined, SettingOutlined, PieChartOutlined } from '@ant-design/icons';
import { Avatar, Button, ConfigProvider, Flex, Layout, Switch, theme } from 'antd';
import './globals.css';





export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState(() => theme.darkAlgorithm);
  const [sideBgColor, setSideBgColor] = useState("rgb(0, 0, 0)");

  const { Content, Sider } = Layout;
  return (
    <html lang="en">
      <body>
        <ConfigProvider theme={{
          algorithm: themeColor,
          components: {
            Layout: {
              algorithm: true,
              triggerBg: sideBgColor,
              siderBg: sideBgColor,
            }
          }
        }}>
          <Layout hasSider>
            <Sider width="50px" className='h-screen'>
              <Flex gap="middle" vertical justify="center" align="center">
                <Avatar shape="square" size="large" src="/app-icon.png" />
                <Button shape="circle" icon={<ClockCircleOutlined />} href='/timer' />
                <Button shape="circle" icon={<PieChartOutlined />} href='/analyse' />
                <Button shape="circle" icon={<SettingOutlined />} href='/settings' />
                <Switch size="small" defaultChecked onChange={(checked) => {
                  if (checked) {
                    setThemeColor(() => { return theme.darkAlgorithm; })
                    setSideBgColor("rgb(0, 0, 0)")
                  } else {
                    setThemeColor(() => { return theme.defaultAlgorithm; })
                    setSideBgColor("rgb(255, 255, 255)")
                  }
                }} />
              </Flex>
            </Sider>
            <Content className='h-screen'>
              <AntdRegistry>{children}</AntdRegistry>
            </Content>
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  )
};
