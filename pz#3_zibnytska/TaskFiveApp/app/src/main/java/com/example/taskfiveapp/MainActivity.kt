package com.example.taskfiveapp

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import java.io.BufferedReader
import java.io.InputStreamReader

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    var currentScreen by remember { mutableStateOf(1) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        // Навігаційна панель
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            Button(onClick = { currentScreen = 1 }) { Text("Рівень 1") }
            Button(onClick = { currentScreen = 2 }) { Text("Рівень 2") }
            Button(onClick = { currentScreen = 3 }) { Text("Рівень 3") }
        }

        Spacer(modifier = Modifier.height(16.dp))
        HorizontalDivider()
        Spacer(modifier = Modifier.height(16.dp))

        when (currentScreen) {
            1 -> LevelOneScreen()
            2 -> LevelTwoScreen()
            3 -> LevelThreeScreen()
        }
    }
}

@Composable
fun LevelOneScreen() {
    var num1 by remember { mutableStateOf("") }
    var num2 by remember { mutableStateOf("") }
    var result by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Рівень 1: Обчислення добутку", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = num1,
            onValueChange = { num1 = it },
            label = { Text("Введіть перше число") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = num2,
            onValueChange = { num2 = it },
            label = { Text("Введіть друге число") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                val val1 = num1.toDoubleOrNull()
                val val2 = num2.toDoubleOrNull()
                if (val1 != null && val2 != null) {
                    result = "Добуток: ${val1 * val2}"
                } else {
                    result = "Помилка: введіть коректні числа!"
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Обчислити добуток")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(text = result, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun LevelTwoScreen() {
    val secretWord = "KOTLIN"
    var guessedLetters by remember { mutableStateOf(setOf<Char>()) }
    var inputLetter by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("Вгадайте літеру або слово!") }

    val displayedWord = secretWord.map { char ->
        if (guessedLetters.contains(char)) char else '_'
    }.joinToString(" ")

    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Рівень 2: Гра \"Вгадай слово\"", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))

        Text("Загадане слово:", style = MaterialTheme.typography.bodyMedium)
        Text(displayedWord, style = MaterialTheme.typography.headlineLarge)

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = inputLetter,
            onValueChange = { if (it.length <= 6) inputLetter = it.uppercase() },
            label = { Text("Ваша літера або все слово") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                val input = inputLetter.trim()
                if (input.isEmpty()) return@Button

                if (input.length == 1) {
                    val char = input[0]
                    if (secretWord.contains(char)) {
                        guessedLetters = guessedLetters + char
                        message = "Правильно! Літера '$char' є у слові."
                    } else {
                        message = "Ні, літери '$char' немає."
                    }
                } else {
                    if (input == secretWord) {
                        guessedLetters = secretWord.toSet()
                        message = "Вітаємо! Ви вгадали слово повністю!"
                    } else {
                        message = "Невірно, це не слово $input."
                    }
                }

                if (secretWord.all { guessedLetters.contains(it) }) {
                    message = "Перемога! Ви відгадали всі літери!"
                }
                inputLetter = ""
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Перевірити")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                guessedLetters = setOf()
                message = "Гру скинуто. Загадано нове слово!"
                inputLetter = ""
            },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Скинути гру")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(text = message, style = MaterialTheme.typography.bodyLarge)
    }
}

@Composable
fun LevelThreeScreen() {
    val context = LocalContext.current
    var fileName by remember { mutableStateOf("Файл не обрано") }
    var wordCount by remember { mutableStateOf<Int?>(null) }
    var errorMessage by remember { mutableStateOf("") }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                context.contentResolver.openInputStream(uri).use { inputStream ->
                    val reader = BufferedReader(InputStreamReader(inputStream))
                    val content = reader.readText()

                    val words = content.split(Regex("\\s+")).filter { it.isNotBlank() }

                    fileName = uri.path?.substringAfterLast("/") ?: "Обраний файл"
                    wordCount = words.size
                    errorMessage = ""
                }
            } catch (e: Exception) {
                errorMessage = "Помилка читання файлу: ${e.localizedMessage}"
                wordCount = null
            }
        }
    }

    Column(modifier = Modifier.fillMaxWidth()) {
        Text("Рівень 3: Підрахунок слів у файлі", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { filePickerLauncher.launch("text/plain") },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Обрати .txt файл")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(text = "Файл: $fileName", style = MaterialTheme.typography.bodyMedium)

        Spacer(modifier = Modifier.height(8.dp))

        if (wordCount != null) {
            Text(
                text = "Кількість слів у файлі: $wordCount",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary
            )
        }

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
        }
    }
}