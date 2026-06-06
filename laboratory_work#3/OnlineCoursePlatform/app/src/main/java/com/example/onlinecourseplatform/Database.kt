package com.example.onlinecourseplatform

object Database {
    val courses = mutableListOf(
        Course(1, "Kotlin для початківців", "Основи мови програмування Kotlin від JetBrains.", 4.8f, true, "В процесі", listOf("Вступ", "Змінні та типи даних", "Функції", "ООП")),
        Course(2, "Android розробка: Рівень 1", "Створення мобільних додатків в Android Studio.", 4.5f, true, "Завершено", listOf("Введення в Android", "ConstraintLayout", "Життєвий цикл", "RecyclerView")),
        Course(3, "Data Science & Machine Learning", "Аналіз даних, Python, Pandas, та перші моделі ML.", 4.9f, false, "Не куплено", listOf("Python для DS", "Математична статистика", "Лінійна регресія"))
    )

    // Поточний авторизований користувач (Рівень 3)
    var currentUser: String? = null
}