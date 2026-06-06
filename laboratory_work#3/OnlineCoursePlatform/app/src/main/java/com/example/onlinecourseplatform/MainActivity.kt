package com.example.onlinecourseplatform

import android.content.Intent
import android.os.Bundle
import android.util.Log // <-- Додали імпорт для логування
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class MainActivity : AppCompatActivity() {
    private lateinit var adapter: CourseAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvWelcome = findViewById<TextView>(R.id.tvWelcome)
        tvWelcome.text = "Вітаємо: ${Database.currentUser ?: "Гість"}"

        val rvCourses = findViewById<RecyclerView>(R.id.rvCourses)
        rvCourses.layoutManager = LinearLayoutManager(this)

        adapter = CourseAdapter(Database.courses) { selectedCourse ->
            val intent = Intent(this, CourseDetailActivity::class.java).apply {
                putExtra("COURSE_ID", selectedCourse.id)
            }
            startActivity(intent)
        }
        rvCourses.adapter = adapter
    }

    override fun onResume() {
        super.onResume()
        adapter.notifyDataSetChanged()

        Log.d("Lifecycle", "MainActivity: onResume викликано. Користувач взаємодіє з екраном.")
    }


    override fun onStart() {
        super.onStart()
        Log.d("Lifecycle", "MainActivity: onStart викликано")
    }

    override fun onPause() {
        super.onPause()
        Log.d("Lifecycle", "MainActivity: onPause викликано. Екран втрачає фокус.")
    }

    override fun onStop() {
        super.onStop()
        Log.d("Lifecycle", "MainActivity: onStop викликано. Екран більше не видимий.")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("Lifecycle", "MainActivity: onDestroy викликано. Процес завершено.")
    }
}