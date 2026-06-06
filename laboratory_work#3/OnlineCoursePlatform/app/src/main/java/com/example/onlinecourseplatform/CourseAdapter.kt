package com.example.onlinecourseplatform

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RatingBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class CourseAdapter(
    private val courses: List<Course>,
    private val onCourseClick: (Course) -> Unit
) : RecyclerView.Adapter<CourseAdapter.CourseViewHolder>() {

    class CourseViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvCourseTitle)
        val status: TextView = view.findViewById(R.id.tvCourseStatus)
        val desc: TextView = view.findViewById(R.id.tvCourseDesc)
        val rating: RatingBar = view.findViewById(R.id.courseRating)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CourseViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_course, parent, false)
        return CourseViewHolder(view)
    }

    override fun onBindViewHolder(holder: CourseViewHolder, position: Int) {
        val course = courses[position]
        holder.title.text = course.title
        holder.desc.text = course.description
        holder.status.text = course.status
        holder.rating.rating = course.rating

        holder.itemView.setOnClickListener { onCourseClick(course) }
    }

    override fun getItemCount() = courses.size
}