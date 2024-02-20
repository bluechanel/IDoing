// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate chrono;

use chrono::{DateTime, Duration, Local};
use rusqlite::{params, Connection, Result};

const DB_PATH: &str = "E:\\tp\\tp.db3";

#[derive(Debug)]
#[allow(dead_code)]
struct CountDown {
    id: u16,
    cd_name: String,
    cd_type: String,
    cd_start_time: String,
    cd_end_time: String,
}

fn main() {
    let _ = init_db();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_time, add, stop, extend])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command(rename_all = "snake_case")]
fn get_time(countdown_id: u16) -> String {
    println!("countdown_id: {}", countdown_id);
    if countdown_id < 1 {
        "45:60".into()
    } else {
        let time_remaining = compute_time(countdown_id).expect("time compute error!!!");
        println!("time: {}", time_remaining);
        time_remaining
    }
}

#[tauri::command]
fn add() -> i64 {
    let add_result = add_countdown();

    let countdown_id = match add_result {
        Ok(cd) => cd,
        Err(e) => panic!("创建计时器失败{}", e),
    };
    countdown_id
}

#[tauri::command(rename_all = "snake_case")]
fn stop(countdown_id: u16) -> String {
    let conn = Connection::open(DB_PATH).expect("db error");
    // 修改结束时间为当前时间
    let local_time = Local::now().format("%Y-%m-%d %H:%M:%S %z").to_string();
    update_db_by_id(&conn, countdown_id, local_time).expect("update faild");
    // 关闭轮询
    println!("stop");
    "stop".into()
}

#[tauri::command(rename_all = "snake_case")]
fn extend(countdown_id: u16) -> String {
    let conn = Connection::open(DB_PATH).expect("db error");
    // 查询当前结束时间
    let current_time = query_db_by_id(countdown_id).expect("未查询到数据!!!");
    // 修改结束时间+5min
    // 关闭轮询
    println!("extend");
    "extend".into()
}

fn init_db() -> Result<()> {
    let conn = Connection::open(DB_PATH)?;
    // 初始化db
    match conn.execute(
        "CREATE TABLE countdown (
            id    INTEGER PRIMARY KEY,
            cd_name  TEXT NOT NULL,
            cd_type  TEXT NOT NULL,
            cd_start_time  TEXT NOT NULL,
            cd_end_time  TEXT NOT NULL
        )",
        (), // empty list of parameters.
    ) {
        Ok(_) => print!("创建表成功"),
        Err(error) => println!("表创建失败:{}", error),
    };
    Ok(())
}

fn add_countdown() -> Result<i64> {
    let conn = Connection::open(DB_PATH)?;

    let cd = CountDown {
        id: 0,
        cd_name: "默认".to_string(),
        cd_type: "work".to_string(),
        cd_start_time: Local::now().format("%Y-%m-%d %H:%M:%S %z").to_string(),
        cd_end_time: (Local::now() + Duration::minutes(45))
            .format("%Y-%m-%d %H:%M:%S %z")
            .to_string(),
    };

    let mut stmt = conn
    .prepare("INSERT INTO countdown (cd_name, cd_type, cd_start_time, cd_end_time) VALUES (?1, ?2, ?3, ?4)")?;
    let id = stmt.insert([&cd.cd_name, &cd.cd_type, &cd.cd_start_time, &cd.cd_end_time])?;
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

fn compute_time(countdown_id: u16) -> Result<String> {
    let countdown = query_db_by_id(countdown_id).expect("查询id不存在！！！");
    let time_remaining = DateTime::parse_from_str(&countdown.cd_end_time, "%Y-%m-%d %H:%M:%S %z")
        .expect(&countdown.cd_end_time);
    let local_time: DateTime<Local> = Local::now();
    let time = time_remaining.signed_duration_since(local_time);
    Ok(format!(
        "{}:{}",
        time.num_minutes() % 60,
        time.num_seconds() % 60
    ))
}
