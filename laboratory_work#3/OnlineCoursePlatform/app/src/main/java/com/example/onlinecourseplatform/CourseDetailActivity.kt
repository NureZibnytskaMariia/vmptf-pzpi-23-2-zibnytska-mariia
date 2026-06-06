package com.example.onlinecourseplatform

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.RatingBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class CourseDetailActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_course_detail)

        val courseId = intent.getIntExtra("COURSE_ID", -1)
        val course = Database.courses.find { it.id == courseId }

        if (course == null) {
            finish()
            return
        }

        val tvTitle = findViewById<TextView>(R.id.tvDetailTitle)
        val tvDesc = findViewById<TextView>(R.id.tvDetailDesc)
        val tvStatus = findViewById<TextView>(R.id.tvDetailStatus)
        val btnEnroll = findViewById<Button>(R.id.btnEnroll)
        val tvSyllabus = findViewById<TextView>(R.id.tvSyllabus)

        val rbNewReview = findViewById<RatingBar>(R.id.rbNewReview)
        val etReviewComment = findViewById<EditText>(R.id.etReviewComment)
        val btnSubmitReview = findViewById<Button>(R.id.btnSubmitReview)

        // Заповнення базових даних
        tvTitle.text = course.title
        tvDesc.text = course.description
        tvStatus.text = "Статус: ${course.status}"

        // Відображення програми навчання (Рівень 3)
        tvSyllabus.text = course.modules.joinToString("\n") { "• $it" }

        // Логіка кнопки запису на курс (Рівень 2)
        if (course.isPurchased) {
            btnEnroll.visibility = View.GONE
        } else {
            btnEnroll.setOnClickListener {
                course.isPurchased = true
                course.status = "В процесі"
                tvStatus.text = "Статус: В процесі"
                btnEnroll.visibility = View.GONE
                Toast.makeText(this, "Ви успішно записались на курс!", Toast.LENGTH_SHORT).show()
            }
        }

        // Додавання відгуку (Рівень 2)
        btnSubmitReview.setOnClickListener {
            val rating = rbNewReview.rating
            val comment = etReviewComment.text.toString()

            if (comment.isNotEmpty()) {
                val userEmail = Database.currentUser ?: "Гість"
                val newReview = Review(userEmail, rating, comment)
                course.reviews.add(newReview)

                Toast.makeText(this, "Відгук додано! (Оцінка: $rating)", Toast.LENGTH_SHORT).show()
                etReviewComment.text.clear()
                rbNewReview.rating = 0f
            } else {
                Toast.makeText(this, "Будь ласка, введіть текст відгуку", Toast.LENGTH_SHORT).show()
            }
        }
    }
}