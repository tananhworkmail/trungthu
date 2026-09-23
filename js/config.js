/**
 * CẤU HÌNH THÔNG TIN DÀNH RIÊNG CHO MĨ DIÊN ❤️ TẤN ANH
 * Món quà Trung Thu ngọt ngào, dễ thương với tông màu vàng yêu thích của nàng!
 */

const CONFIG = {
    // 1. THÔNG TIN CỦA HAI BẠN
    recipientName: "Mĩ Diên",                    // Biệt danh siêu dễ thương của cô ấy
    recipientFullName: "Trần Thị Mỹ Duyên",      // Tên đầy đủ
    senderName: "Tấn Anh",                       // Tên của bạn
    anniversaryDate: "2026-08-22",               // Ngày chính thức quen nhau: 22/08/2026
    
    // 2. LỜI CHÀO BAN ĐẦU KHI MỞ TRANG WEB TRÊN ĐIỆN THOẠI
    welcomeTitle: "Món Quà Trung Thu Gửi Mĩ Diên 🌕💛",
    welcomeSubtitle: "Chạm nhẹ vào chiếc đèn lồng vàng để thắp sáng đêm rằm dành riêng cho em bé nhé...",
    lanternPrompt: "Chạm để thắp sáng đêm trăng ✨",

    // 3. THÔNG ĐIỆP CHÍNH DƯỚI VẦNG TRĂNG
    headerBadge: "🌕 Đêm Rằm Trung Thu Của Mĩ Diên & Tấn Anh 💛",
    mainHeadline: "Vầng Trăng Của Anh Mang Tên <span class=\"recipient-name\">Mĩ Diên</span>",
    subHeadline: "Anh biết Mĩ Diên thích màu vàng của hoa hướng dương và ánh trăng rằm. Nhưng với Tấn Anh, nụ cười của Mĩ Diên mới chính là màu vàng ấm áp, đáng yêu nhất trần đời!",

    // 4. BỨC THƯ TÌNH DƯỚI ÁNH TRĂNG DÀNH RIÊNG CHO MĨ DIÊN (Hiệu ứng gõ chữ Typewriter)
    letterTitle: "Gửi Mĩ Diên Dễ Thương Của Tấn Anh 💌",
    letterPhoto: "images/my-duyen.jpg",
    letterContent: [
        "Mĩ Diên ơi! Chúc em bé có một mùa Tết Trung Thu thật nhiều niềm vui, ấm áp và ngập tràn hạnh phúc nhé! 🐰✨",
        "Anh biết Diên rất thích màu vàng — màu của ánh trăng rằm dịu dàng, màu của nắng sớm ban mai và cũng là màu của sự lạc quan, rạng rỡ. Nhưng em biết không, trong mắt anh, nụ cười đáng yêu của Diên còn tỏa sáng hơn cả vầng trăng rằm tháng Tám.",
        "Kể từ ngày 22/8/2026 định mệnh ấy, cuộc sống của anh có thêm biết bao nhiêu tiếng cười và điều ngọt ngào. Mỗi ngày trôi qua được trò chuyện, được lắng nghe và nhìn thấy sự dễ thương của em là niềm hạnh phúc lớn nhất của Tấn Anh.",
        "Trung Thu năm nay là mùa trăng đầu tiên chúng mình đồng hành cùng nhau. Anh muốn gửi trọn vào bầu trời ngàn vì sao này tất cả sự cưng chiều và yêu thương nhất dành cho em.",
        "Chúc cho cô gái nhỏ Trần Thị Mỹ Duyên của anh luôn mỉm cười rạng rỡ, ăn ngon ngủ ngoan, không phải âu lo muộn phiền điều gì. Dù thế giới ngoài kia có ra sao, anh vẫn sẽ luôn ở đây để bảo vệ, chở che và thương em thật nhiều.",
        "Thỏ ngọc có cung trăng, còn Mĩ Diên thì có trọn vẹn trái tim của Tấn Anh rồi nhé! 🌕💛",
        "Yêu Mĩ Diên nhiều hơn tất cả các vì sao trên dải ngân hà! Moahhh! 💖🐰✨"
    ],

    // 5. BỘ SƯU TẬP ẢNH KỶ NIỆM (TẬP HỢP ẢNH THẬT & STICKER CHIBI CỦA HAI BẠN)
    memories: [
        {
            image: "images/my-duyen.jpg",
            title: "Ánh Trăng Đẹp Nhất: Trần Thị Mỹ Duyên",
            desc: "Nụ cười rạng rỡ và đôi mắt đeo kính siêu đáng yêu của Mĩ Diên chính là ánh mặt trời màu vàng ấm áp nhất trong lòng Tấn Anh 💛"
        },
        {
            image: "images/tananh-midyen-moon.jpg",
            title: "Tấn Anh & Mĩ Diên Ngắm Trăng Rằm",
            desc: "Hai đứa mình cùng mặc đồ ngủ đôi, ôm chiếc đèn ông sao vàng lấp lánh và cùng nhau ước nguyện dưới vầng trăng tròn."
        },
        {
            image: "images/chibi-couple-2.png",
            title: "Nụ Hôn Ngọt Ngào Dưới Trăng",
            desc: "Tấn Anh thơm má Mĩ Diên cưng xỉu! Chúc cô bé của anh luôn được cưng chiều và hạnh phúc nhất trần đời."
        },
        {
            image: "images/chibi-couple-3.png",
            title: "Cái Ôm Ấm Áp Của Chúng Mình",
            desc: "Mĩ Diên ôm chặt cổ Tấn Anh cười tít mắt. Vòng tay của anh sẽ luôn là nơi bình yên và an toàn nhất cho em."
        },
        {
            image: "images/chibi-couple-1.png",
            title: "Xoa Đầu Em Bé Ngoan",
            desc: "Xoa đầu bé cưng Mĩ Diên ngoan ngoãn. Anh hứa sẽ luôn lắng nghe và thương em thật nhiều mỗi ngày!"
        },
        {
            image: "images/cute-bunny.jpg",
            title: "Bé Thỏ Vàng Dễ Thương",
            desc: "Bé thỏ ôm chiếc đèn ngôi sao vàng lấp lánh — biểu tượng may mắn và ngọt ngào dành tặng riêng cho Mĩ Diên."
        }
    ],

    // 6. NHỮNG ĐIỀU ƯỚC GỢI Ý SIÊU DỄ THƯƠNG
    wishesPreset: [
        "💛 Chúc Mĩ Diên luôn xinh đẹp & cười thật tươi",
        "🐰 Tấn Anh mãi yêu và cưng chiều Mĩ Diên",
        "🌸 Chúc em bé ăn ngoan, ngủ say và luôn vui vẻ",
        "✨ Mong tình yêu của chúng mình mãi ngọt ngào",
        "🌕 Mĩ Diên là cô bé đáng yêu nhất vũ trụ!"
    ],

    // 7. ÂM NHẠC LÃNG MẠN DU DƯƠNG
    audioSrc: "audio/bgm.mp3",
    audioTitle: "Ánh Trăng Nói Hộ Lòng Tôi - Tấn Anh tặng Mĩ Diên"
};
