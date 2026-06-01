import * as studentService from '@/app/services/student.service'

export async function getAllStudents(req, res) {
    const students = await studentService.getAllStudents()
    res.json({
        success: true,
        data: students
    })
}

export async function toggleStudentStatus(req, res) {
    const { id } = req.params
    const result = await studentService.toggleStudentStatus(id)
    res.json({
        success: true,
        message: `Đã ${result.status === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản sinh viên thành công`,
        data: result
    })
}

export async function updateStudentDetails(req, res) {
    const { id } = req.params
    const { phone, studentId } = req.body
    
    await studentService.updateStudentDetails(id, { phone, studentId })
    
    res.json({
        success: true,
        message: 'Cập nhật thông tin sinh viên thành công'
    })
}
