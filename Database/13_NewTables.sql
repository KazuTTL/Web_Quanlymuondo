USE QuanLyMuonThietBi;
GO -- =====================================================
    -- FILE 13: BẢNG MỚI — MỞ RỘNG MÔ HÌNH DỮ LIỆU
    -- =====================================================
    -- Môn học: RIPT1307 - Quản trị Cơ sở dữ liệu nâng cao
    -- =====================================================
    -- 1. Faculties (Khoa/Vi?n)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'Faculties')
            AND type = 'U'
    ) BEGIN CREATE TABLE Faculties (
        FacultyID INT IDENTITY(1, 1) NOT NULL,
        MaKhoa VARCHAR(20) NOT NULL,
        TenKhoa NVARCHAR(200) NOT NULL,
        MoTa NVARCHAR(500) NULL,
        SoDienThoai VARCHAR(15) NULL,
        Email VARCHAR(100) NULL,
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_Faculties PRIMARY KEY (FacultyID),
        CONSTRAINT UQ_Faculties_MaKhoa UNIQUE (MaKhoa)
    );
END
GO -- 2. Classes 
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'Classes')
            AND type = 'U'
    ) BEGIN CREATE TABLE Classes (
        ClassID INT IDENTITY(1, 1) NOT NULL,
        MaLop VARCHAR(20) NOT NULL,
        TenLop NVARCHAR(200) NOT NULL,
        FacultyID INT NOT NULL,
        KhoaHoc VARCHAR(10) NULL,
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_Classes PRIMARY KEY (ClassID),
        CONSTRAINT UQ_Classes_MaLop UNIQUE (MaLop),
        CONSTRAINT FK_Classes_Faculties FOREIGN KEY (FacultyID) REFERENCES Faculties(FacultyID)
    );
END
GO -- 3. Students (Thong tin chi tiet sinh vien)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'Students')
            AND type = 'U'
    ) BEGIN CREATE TABLE Students (
        StudentID INT IDENTITY(1, 1) NOT NULL,
        UserID INT NOT NULL,
        MaSinhVien VARCHAR(20) NOT NULL,
        ClassID INT NULL,
        Khoa INT NULL,
        NgayVaoTruong DATE NULL,
        TrangThaiHocTap NVARCHAR(20) NOT NULL DEFAULT N'dang_hoc',
        CONSTRAINT PK_Students PRIMARY KEY (StudentID),
        CONSTRAINT UQ_Students_UserID UNIQUE (UserID),
        CONSTRAINT UQ_Students_MaSinhVien UNIQUE (MaSinhVien),
        CONSTRAINT FK_Students_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT FK_Students_Classes FOREIGN KEY (ClassID) REFERENCES Classes(ClassID),
        CONSTRAINT CK_Students_TrangThaiHocTap CHECK (
            TrangThaiHocTap IN (N'dang_hoc', N'da_nghi', N'tot_nghiep')
        )
    );
END
GO -- 4. Suppliers (Nha cung cap thiet bi)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'Suppliers')
            AND type = 'U'
    ) BEGIN CREATE TABLE Suppliers (
        SupplierID INT IDENTITY(1, 1) NOT NULL,
        TenNhaCungCap NVARCHAR(200) NOT NULL,
        MaSoThue VARCHAR(20) NULL,
        DiaChi NVARCHAR(500) NULL,
        SoDienThoai VARCHAR(15) NULL,
        Email VARCHAR(100) NULL,
        Website VARCHAR(200) NULL,
        GhiChu NVARCHAR(500) NULL,
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_Suppliers PRIMARY KEY (SupplierID)
    );
END
GO -- 5. DeviceDamages (Hu hong, mat mat thiet bi)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'DeviceDamages')
            AND type = 'U'
    ) BEGIN CREATE TABLE DeviceDamages (
        DamageID INT IDENTITY(1, 1) NOT NULL,
        RecordID INT NOT NULL,
        DeviceID INT NOT NULL,
        LoaiHangHai NVARCHAR(50) NOT NULL,
        MoTaChiTiet NVARCHAR(MAX) NOT NULL,
        MucDoHangHai TINYINT NOT NULL DEFAULT 1,
        NgayPhatHien DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        NgayXuLy DATE NULL,
        TrangThaiXuLy NVARCHAR(20) NOT NULL DEFAULT N'chua_xu_ly',
        CONSTRAINT PK_DeviceDamages PRIMARY KEY (DamageID),
        CONSTRAINT FK_DeviceDamages_Records FOREIGN KEY (RecordID) REFERENCES BorrowRecords(RecordID),
        CONSTRAINT FK_DeviceDamages_Devices FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID),
        CONSTRAINT CK_DeviceDamages_Loai CHECK (
            LoaiHangHai IN (N'hong', N'mat', N'hu_hong_nhe')
        ),
        CONSTRAINT CK_DeviceDamages_TrangThai CHECK (
            TrangThaiXuLy IN (
                N'chua_xu_ly',
                N'dang_xu_ly',
                N'da_xu_ly',
                N'khong_xu_ly'
            )
        )
    );
END
GO -- 6. MaintenanceRecords (Lich su bao tri thiet bi)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'MaintenanceRecords')
            AND type = 'U'
    ) BEGIN CREATE TABLE MaintenanceRecords (
        MaintenanceID INT IDENTITY(1, 1) NOT NULL,
        DeviceID INT NOT NULL,
        UserID INT NULL,
        NgayBatDau DATE NOT NULL,
        NgayKetThuc DATE NULL,
        LoaiBaoTri NVARCHAR(50) NOT NULL,
        MoTa NVARCHAR(MAX) NULL,
        ChiPhi DECIMAL(18, 0) NULL,
        TrangThai NVARCHAR(20) NOT NULL DEFAULT N'dang_thuc_hien',
        CONSTRAINT PK_MaintenanceRecords PRIMARY KEY (MaintenanceID),
        CONSTRAINT FK_MaintenanceRecords_Devices FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID),
        CONSTRAINT FK_MaintenanceRecords_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT CK_MaintenanceRecords_Loai CHECK (
            LoaiBaoTri IN (N'dinh_ky', N'dot_xuat', N'sua_chua')
        ),
        CONSTRAINT CK_MaintenanceRecords_TrangThai CHECK (
            TrangThai IN (N'dang_thuc_hien', N'hoan_thanh', N'huy')
        )
    );
END
GO -- 7. Fines (Tien phat)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'Fines')
            AND type = 'U'
    ) BEGIN CREATE TABLE Fines (
        FineID INT IDENTITY(1, 1) NOT NULL,
        UserID INT NOT NULL,
        RecordID INT NULL,
        DamageID INT NULL,
        SoTien DECIMAL(18, 0) NOT NULL,
        LyDo NVARCHAR(500) NOT NULL,
        NgayPhat DATETIME NOT NULL DEFAULT GETDATE(),
        HanThanhToan DATE NULL,
        NgayThanhToan DATETIME NULL,
        TrangThai NVARCHAR(20) NOT NULL DEFAULT N'chua_thanh_toan',
        CONSTRAINT PK_Fines PRIMARY KEY (FineID),
        CONSTRAINT FK_Fines_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT FK_Fines_Records FOREIGN KEY (RecordID) REFERENCES BorrowRecords(RecordID),
        CONSTRAINT FK_Fines_Damages FOREIGN KEY (DamageID) REFERENCES DeviceDamages(DamageID),
        CONSTRAINT CK_Fines_SoTien CHECK (SoTien > 0),
        CONSTRAINT CK_Fines_TrangThai CHECK (
            TrangThai IN (N'chua_thanh_toan', N'da_thanh_toan', N'xoa')
        )
    );
END
GO -- 8. Notifications (Thong bao noi bo)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N 'Notifications')
            AND type = 'U'
    ) BEGIN CREATE TABLE Notifications (
        NotificationID INT IDENTITY(1, 1) NOT NULL,
        UserID INT NOT NULL,
        TieuDe NVARCHAR(200) NOT NULL,
        NoiDung NVARCHAR(MAX) NULL,
        LoaiThongBao NVARCHAR(50) NOT NULL,
        Link VARCHAR(500) NULL,
        DaXem BIT NOT NULL DEFAULT 0,
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_Notifications PRIMARY KEY (NotificationID),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT CK_Notifications_Loai CHECK (
            LoaiThongBao IN (
                N'duyet',
                N'tu_choi',
                N'qua_han',
                N'nhe_nhac',
                N'he_thong'
            )
        )
    );
END
GO -- 9. DeviceReservations (Dat truoc thiet bi)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'DeviceReservations')
            AND type = 'U'
    ) BEGIN CREATE TABLE DeviceReservations (
        ReservationID INT IDENTITY(1, 1) NOT NULL,
        DeviceID INT NOT NULL,
        UserID INT NOT NULL,
        NgayMuonDuKien DATE NOT NULL,
        NgayTraDuKien DATE NOT NULL,
        SoLuong INT NOT NULL DEFAULT 1,
        TrangThai NVARCHAR(20) NOT NULL DEFAULT N'dat_truoc',
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_DeviceReservations PRIMARY KEY (ReservationID),
        CONSTRAINT FK_DeviceReservations_Devices FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID),
        CONSTRAINT FK_DeviceReservations_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT CK_Reservations_TrangThai CHECK (
            TrangThai IN (N'dat_truoc', N'da_muon', N'da_huy')
        ),
        CONSTRAINT CK_Reservations_Ngay CHECK (NgayTraDuKien >= NgayMuonDuKien)
    );
END
GO -- 10. DeviceImages (Hinh anh thiet bi)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'DeviceImages')
            AND type = 'U'
    ) BEGIN CREATE TABLE DeviceImages (
        ImageID INT IDENTITY(1, 1) NOT NULL,
        DeviceID INT NOT NULL,
        URL VARCHAR(500) NOT NULL,
        MoTa NVARCHAR(255) NULL,
        LaAnhChinh BIT NOT NULL DEFAULT 0,
        ThuTu INT NOT NULL DEFAULT 0,
        CONSTRAINT PK_DeviceImages PRIMARY KEY (ImageID),
        CONSTRAINT FK_DeviceImages_Devices FOREIGN KEY (DeviceID) REFERENCES Devices(DeviceID)
    );
END
GO -- 11. BorrowSessions (Phien muon — muonn nhieu thiet bi cung luc)
    -- =====================================================
    IF NOT EXISTS (
        SELECT *
        FROM sys.objects
        WHERE object_id = OBJECT_ID(N'BorrowSessions')
            AND type = 'U'
    ) BEGIN CREATE TABLE BorrowSessions (
        SessionID INT IDENTITY(1, 1) NOT NULL,
        UserID INT NOT NULL,
        NgayMuon DATE NOT NULL,
        NgayTraDuKien DATE NOT NULL,
        TrangThai NVARCHAR(20) NOT NULL DEFAULT N'dang_muon',
        NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_BorrowSessions PRIMARY KEY (SessionID),
        CONSTRAINT FK_BorrowSessions_Users FOREIGN KEY (UserID) REFERENCES Users(UserID),
        CONSTRAINT CK_Sessions_TrangThai CHECK (
            TrangThai IN (N'dang_muon', N'da_tra', N'qua_han')
        )
    );
END
GO -- Them cot SessionID vao BorrowRecords
    IF NOT EXISTS (
        SELECT *
        FROM sys.columns
        WHERE object_id = OBJECT_ID('BorrowRecords')
            AND name = 'SessionID'
    ) BEGIN
ALTER TABLE BorrowRecords
ADD SessionID INT NULL;
ALTER TABLE BorrowRecords
ADD CONSTRAINT FK_BorrowRecords_Sessions FOREIGN KEY (SessionID) REFERENCES BorrowSessions(SessionID);
END
GO