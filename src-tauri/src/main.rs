// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate chrono;

use chrono::{TimeZone, Utc};
use log::{error, info, warn};
use rusqlite::{params, Connection, Result};
use tauri_plugin_log::LogTarget;

const DB_PATH: &str = "E:\\tp\\tp.db3";

#[derive(serde::Serialize)]
struct CountdownShow {
    time_remaining: String,
    progress_remaining: f32,
    is_tip: bool,
    tip_message: String,
}

#[derive(Debug)]
#[allow(dead_code)]
struct CountDown {
    id: u16,
    cd_name: String,
    cd_type: String,
    cd_start_time: i64,
    cd_end_time: i64,
}

fn main() {
    let _ = init_db();
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build()
        )
        .invoke_handler(tauri::generate_handler![get_time, add, stop, extend])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command(rename_all = "snake_case")]
fn get_time(countdown_id: u16) -> Result<CountdownShow, String> {
    info!("countdown_id: {}", countdown_id);
    let countdown_init = CountdownShow {
        time_remaining: "45:60".to_string(),
        progress_remaining: 1.0,
        is_tip: false,
        tip_message: "".to_string(),
    };
    Ok(if countdown_id < 1 {
        countdown_init
    } else {
        let countdown = query_db_by_id(countdown_id);
        match countdown {
            Err(err) => {
                error!("id 未查询到数据！！！{}", err);
                countdown_init
            }
            Ok(countdown) => {
                let time_remaining = countdown.cd_end_time - Utc::now().timestamp();
                if time_remaining <= 0 {
                    CountdownShow {
                        time_remaining: "00:00".to_string(),
                        progress_remaining: 0.0,
                        is_tip: true,
                        tip_message: "专注时间结束".to_string(),
                    }
                } else {
                    CountdownShow {
                        time_remaining: Utc
                            .timestamp_opt(time_remaining, 0)
                            .unwrap()
                            .format("%M:%S")
                            .to_string(),
                        progress_remaining: (countdown.cd_end_time - Utc::now().timestamp()) as f32
                            / (countdown.cd_end_time - countdown.cd_start_time) as f32,
                        is_tip: false,
                        tip_message: "".to_string(),
                    }
                }
            }
        }
    })
}

#[tauri::command]
fn add() -> i64 {
    add_countdown().expect("创建计时器失败")
}

#[tauri::command(rename_all = "snake_case")]
fn stop(countdown_id: u16) {
    let conn = Connection::open(DB_PATH).expect("db error");
    // 修改结束时间为当前时间
    let current_time = Utc::now().timestamp().to_string();
    match update_db_by_id(&conn, countdown_id, current_time) {
        Ok(_) => {
            info!("已停止计时!!!")
        }
        Err(err) => {
            error!("停止错误!!!{}", err)
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn extend(countdown_id: u16) -> () {
    let conn = Connection::open(DB_PATH).expect("db error");
    match query_db_by_id(countdown_id) {
        Ok(current_countdown) => match update_db_by_id(
            &conn,
            countdown_id,
            (current_countdown.cd_end_time + 5 * 60).to_string(),
        ) {
            Ok(_) => (),
            Err(err) => error!("更新失败 {}", err),
        },
        Err(err) => {
            error!("id 未查询到数据！！！{}", err)
        }
    }
}

fn init_db() -> Result<()> {
    let conn = Connection::open(DB_PATH)?;
    // 初始化db
    match conn.execute(
        "CREATE TABLE countdown (
            id    INTEGER PRIMARY KEY,
            cd_name  TEXT NOT NULL,
            cd_type  TEXT NOT NULL,
            cd_start_time  INTEGER NOT NULL,
            cd_end_time  INTEGER NOT NULL
        )",
        (), // empty list of parameters.
    ) {
        Ok(_) => warn!("创建表成功"),
        Err(error) => error!("表创建失败:{}", error),
    };
    Ok(())
}

fn add_countdown() -> Result<i64> {
    let conn = Connection::open(DB_PATH)?;

    let current_timstamp = Utc::now().timestamp();

    let cd = CountDown {
        id: 0,
        cd_name: "默认".to_string(),
        cd_type: "work".to_string(),
        cd_start_time: current_timstamp,
        cd_end_time: current_timstamp + 45 * 60,
    };

    let mut stmt = conn
    .prepare("INSERT INTO countdown (cd_name, cd_type, cd_start_time, cd_end_time) VALUES (?1, ?2, ?3, ?4)")?;
    let id = stmt.insert([
        &cd.cd_name,
        &cd.cd_type,
        &cd.cd_start_time.to_string(),
        &cd.cd_end_time.to_string(),
    ])?;
    Ok(id)
}

// fn query_database() -> Result<Vec<CountDown>> {
//     let conn = Connection::open(DB_PATH)?;
//     let mut stmt = conn
//         .prepare("SELECT cd_uuid, cd_name, cd_type, cd_start_time, cd_end_time FROM countdown")?;
//     let countdown_iter = stmt.query_map([], |row| {
//         Ok(CountDown {
//             cd_uuid: row.get(0)?,
//             cd_name: row.get(1)?,
//             cd_type: row.get(2)?,
//             cd_start_time: row.get(3)?,
//             cd_end_time: row.get(4)?,
//         })
//     })?;
//     let mut countdown = Vec::new();
//     for p in countdown_iter {
//         countdown.push(p?)
//     }
//     Ok(countdown)
// }

fn query_db_by_id(countdown_id: u16) -> Result<CountDown> {
    let conn = Connection::open(DB_PATH)?;
    let mut stmt = conn.prepare(
        "SELECT id, cd_name, cd_type, cd_start_time, cd_end_time FROM countdown WHERE id = ?1",
    )?;
    stmt.query_row([&countdown_id], |row| {
        Ok(CountDown {
            id: row.get(0)?,
            cd_name: row.get(1)?,
            cd_type: row.get(2)?,
            cd_start_time: row.get(3)?,
            cd_end_time: row.get(4)?,
        })
    })
}

fn update_db_by_id(conn: &Connection, countdown_id: u16, end_time: String) -> Result<usize> {
    conn.execute(
        "UPDATE countdown SET cd_end_time = ?1 WHERE id = ?2;",
        params![end_time, countdown_id],
    )
}
