package com.example.onlinecourseplatform

// Модель для відгуків (Рівень 2)
data class Review(
    val userEmail: String,
    val rating: Float,
    val comment: String
)

// Модель для курсів (Рівні 1, 2, 3)
data class Course(
    val id: Int,
    val title: String,
    val description: String,
    val rating: Float,
    var isPurchased: Boolean = false,
    var status: String = "Не куплено",
    val modules: List<String> = listOf(), // Навчальна програма (Рівень 3)
    val reviews: MutableList<Review> = mutableListOf()
)