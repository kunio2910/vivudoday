/* Illustration anchors are percentages, NOT geographic coordinates. */
window.MapCatalog = {
  // Discovery suggestions: not geocoded POIs. Never manufacture GPS from artwork.
  suggestions: {
    'Cao Bằng':['Thác Bản Giốc','Động Ngườm Ngao'],
    'Điện Biên':['Đồi A1','Bảo tàng Chiến thắng Điện Biên Phủ'],
    'Lai Châu':['Đèo Ô Quy Hồ','Bản Sin Suối Hồ'],
    'Sơn La':['Mộc Châu','Tà Xùa'],
    'Lào Cai':['Sa Pa','Mù Cang Chải'],
    'Tuyên Quang':['Cao nguyên đá Đồng Văn','Khu di tích Tân Trào'],
    'Thái Nguyên':['Hồ Núi Cốc','Hồ Ba Bể'],
    'Lạng Sơn':['Động Tam Thanh','Mẫu Sơn'],
    'Bắc Ninh':['Chùa Dâu','Chùa Vĩnh Nghiêm'],
    'Phú Thọ':['Đền Hùng','Mai Châu'],
    'Hà Nội':['Văn Miếu – Quốc Tử Giám','Hồ Hoàn Kiếm'],
    'Hải Phòng':['Cát Bà','Côn Sơn – Kiếp Bạc'],
    'Hưng Yên':['Phố Hiến','Chùa Keo'],
    'Ninh Bình':['Tràng An','Tam Cốc','Hang Múa'],
    'Quảng Ninh':['Vịnh Hạ Long','Yên Tử'],
    'Thanh Hóa':['Thành nhà Hồ','Pù Luông'],
    'Nghệ An':['Khu di tích Kim Liên','Vườn quốc gia Pù Mát'],
    'Hà Tĩnh':['Ngã ba Đồng Lộc','Biển Thiên Cầm'],
    'Quảng Trị':['Phong Nha – Kẻ Bàng','Thành cổ Quảng Trị'],
    'Huế':['Đại Nội Huế','Chùa Thiên Mụ'],
    'Đà Nẵng':['Phố cổ Hội An','Thánh địa Mỹ Sơn'],
    'Quảng Ngãi':['Đảo Lý Sơn','Măng Đen'],
    'Khánh Hòa':['Tháp Bà Ponagar','Vịnh Vĩnh Hy'],
    'Gia Lai':['Biển Hồ','Kỳ Co'],
    'Đắk Lắk':['Hồ Lắk','Gành Đá Đĩa'],
    'Lâm Đồng':['Đà Lạt','Đồi cát Mũi Né'],
    'Đồng Nai':['Vườn quốc gia Cát Tiên','Núi Bà Rá'],
    'TP. Hồ Chí Minh':['Dinh Độc Lập','Địa đạo Củ Chi','Côn Đảo'],
    'Tây Ninh':['Núi Bà Đen','Làng nổi Tân Lập'],
    'Đồng Tháp':['Vườn quốc gia Tràm Chim','Cù lao Thới Sơn'],
    'Vĩnh Long':['Cù lao An Bình','Ao Bà Om'],
    'An Giang':['Rừng tràm Trà Sư','Phú Quốc'],
    'Cần Thơ':['Chợ nổi Cái Răng','Chùa Dơi'],
    'Cà Mau':['Mũi Cà Mau','Nhà Công tử Bạc Liêu']
  },
  provinceSources: {
    'Ninh Bình':'https://www.vietnam.travel/vi/places-to-go/northern-vietnam/ninh-binh',
    'Cao Bằng':'https://www.vietnam.travel/vi/things-to-do/discovering-cao-bang-7-must-do-experiences'
  },
  cluster(points,width,height,distance=25){
    const groups=[];
    for(const point of points){
      const hits=groups.filter(group=>group.some(p=>Math.hypot((p.x-point.x)*width/100,(p.y-point.y)*height/100)<distance));
      const merged=[point,...hits.flat()];
      for(const group of hits)groups.splice(groups.indexOf(group),1);
      groups.push(merged);
    }
    return groups;
  },
  anchors: {
    'Điện Biên':[10,15],'Lai Châu':[12,9],'Sơn La':[21,18],'Lào Cai':[23,10],
    'Tuyên Quang':[32,8],'Cao Bằng':[39,6],'Thái Nguyên':[35,13],'Lạng Sơn':[44,11],
    'Phú Thọ':[29,17],'Hà Nội':[36,19],'Bắc Ninh':[40,16],'Quảng Ninh':[48,15],
    'Hải Phòng':[44,20],'Hưng Yên':[39,22],'Ninh Bình':[35,24],'Thanh Hóa':[32,28],
    'Nghệ An':[32,32],'Hà Tĩnh':[37,36],'Quảng Trị':[43,40],'Huế':[48,44],
    'Đà Nẵng':[53,48],'Quảng Ngãi':[57,53],'Gia Lai':[50,56],'Đắk Lắk':[53,61],
    'Khánh Hòa':[62,61],'Lâm Đồng':[53,66],'Đồng Nai':[49,70],'TP. Hồ Chí Minh':[44,73],
    'Tây Ninh':[38,69],'Đồng Tháp':[35,76],'An Giang':[29,76],'Vĩnh Long':[40,79],
    'Cần Thơ':[34,82],'Cà Mau':[29,88]
  },
  districts: {
    'Quận 1':[60,38],'Quận 3':[50,37],'Quận 4':[58,43],'Quận 5':[41,43],
    'Quận 6':[33,44],'Quận 7':[62,48],'Quận 8':[41,48],'Quận 10':[41,37],
    'Quận 11':[38,40],'Quận 12':[47,23],'Bình Thạnh':[61,30],'Gò Vấp':[51,27],
    'Phú Nhuận':[51,33],'Tân Bình':[40,31],'Tân Phú':[31,35],'Bình Tân':[19,38],
    'TP. Thủ Đức':[79,30],'Huyện Củ Chi':[22,14],'Huyện Hóc Môn':[30,22],
    'Huyện Bình Chánh':[25,54],'Huyện Nhà Bè':[52,57],'Huyện Cần Giờ':[70,73]
  },
  details: {
    'Bảo tàng Chứng tích Chiến tranh':{description:'Trưng bày tư liệu, ảnh và hiện vật về hậu quả chiến tranh.',address:'28 Võ Văn Tần, TP. Hồ Chí Minh',source:'https://vietnam.travel/node/1613'},
    'Bưu điện Thành phố':{description:'Công trình bưu điện lâu đời bên cạnh Nhà thờ Đức Bà.',address:'2 Công xã Paris, TP. Hồ Chí Minh',source:'https://vietnam.travel/node/1613'},
    'Landmark 81':{description:'Tòa tháp với đài quan sát nhìn ra thành phố.',address:'720A Điện Biên Phủ, TP. Hồ Chí Minh',source:'https://vietnam.travel/node/1613'},
    'Địa đạo Củ Chi':{description:'Hệ thống đường hầm lịch sử; cần chọn đúng khu tham quan trước khi chỉ đường.',address:'Tỉnh lộ 15, khu vực Phú Hiệp, Củ Chi',source:'https://vietnam.travel/node/1613'},
    'Khu du lịch Vàm Sát':{description:'Điểm tham quan sinh thái trong vùng rừng ngập mặn Cần Giờ. Liên hệ đơn vị vận hành để kiểm tra tuyến tham quan trước chuyến đi.',source:'https://vamsat.vn/wp-content/uploads/2020/02/bang-gia-duong-thuy.pdf'},
    'Dinh Độc Lập':{description:'Di tích lịch sử với các không gian kiến trúc và trưng bày về lịch sử Việt Nam.',address:'135 Nam Kỳ Khởi Nghĩa, TP. Hồ Chí Minh',source:'https://dinhdoclap.gov.vn/so-do-dinh-doc-lap/'},
    'Công viên văn hóa Đầm Sen':{description:'Công viên giải trí gồm khu trò chơi, vườn thú và thủy cung. Kiểm tra dịch vụ đang hoạt động trước khi đến.',address:'3 Hòa Bình / 1A Lạc Long Quân, TP. Hồ Chí Minh',source:'https://damsenpark.vn/thong-tin-lien-he/'},
    'Khu du lịch Suối Tiên':{description:'Khu du lịch văn hóa và giải trí; xem sơ đồ chính thức để chọn khu tham quan phù hợp.',source:'https://suoitien.com/ban-do'},
    'Chùa Giác Viên':{description:'Ngôi chùa trong khu vực Đầm Sen, có kiến trúc và di sản văn hóa Phật giáo.',address:'161/35/20 Lạc Long Quân, TP. Hồ Chí Minh',source:'https://www.vietnam-pagodas.com/vi/chua/chua-giac-vien',latitude:10.76302,longitude:106.63924}
  },
  additionalHcm: [
    {name:'Phố Phan Xích Long',district:'Phú Nhuận',category:'Ẩm thực',description:'Tuyến phố thương mại với nhiều địa điểm ăn uống.',address:'Phan Xích Long, khu vực Phú Nhuận, TP. Hồ Chí Minh',source:'https://pntc.vn/ct-du-an/du-an-duong-phan-xich-long.22'},
    {name:'Bảo tàng Lịch sử TP. Hồ Chí Minh',district:'Quận 1',category:'Bảo tàng',description:'Bộ sưu tập hiện vật về lịch sử và văn hóa Việt Nam.',address:'2 Nguyễn Bỉnh Khiêm, TP. Hồ Chí Minh'},
    {name:'Bảo tàng Mỹ thuật TP. Hồ Chí Minh',district:'Quận 1',category:'Bảo tàng',description:'Không gian giới thiệu mỹ thuật và các bộ sưu tập điêu khắc.',address:'97A Đức Chính, TP. Hồ Chí Minh'},
    {name:'Bảo tàng Áo dài',district:'TP. Thủ Đức',category:'Bảo tàng',description:'Giới thiệu lịch sử và giá trị văn hóa của áo dài.',address:'206/19/30 Long Thuận, khu vực Long Phước, TP. Hồ Chí Minh'},
    {name:'Điểm du lịch cộng đồng Thiềng Liềng',district:'Huyện Cần Giờ',category:'Du lịch cộng đồng',description:'Xóm đảo với ruộng muối và sinh hoạt cộng đồng.',address:'Thiềng Liềng, khu vực đảo Thạnh An, Cần Giờ'}
  ],
  // POI seed data for the Hanoi city map. Coordinates are map pins for discovery,
  // not turn-by-turn routing coordinates; verify with the venue before a trip.
  hanoiLandmarks: [
    {district:'Hoàn Kiếm',name:'Hồ Hoàn Kiếm',category:'Biểu tượng',latitude:21.0287,longitude:105.8525,description:'Không gian hồ trung tâm và biểu tượng văn hóa của Hà Nội.',address:'Khu vực hồ Hoàn Kiếm, Hà Nội'},
    {district:'Hoàn Kiếm',name:'Đền Ngọc Sơn',category:'Di tích',latitude:21.0305,longitude:105.8526,description:'Di tích nằm trên đảo Ngọc giữa hồ Hoàn Kiếm.',address:'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội'},
    {district:'Hoàn Kiếm',name:'Phố cổ Hà Nội',category:'Văn hóa',latitude:21.0340,longitude:105.8520,description:'Khu phố lịch sử với mạng lưới phố nghề, ẩm thực và không gian đi bộ.',address:'Khu phố cổ, Hoàn Kiếm, Hà Nội'},
    {district:'Đống Đa',name:'Văn Miếu – Quốc Tử Giám',category:'Di tích',latitude:21.0278,longitude:105.8356,description:'Quần thể di tích gắn với truyền thống giáo dục và khoa bảng Việt Nam.',address:'58 Quốc Tử Giám, Đống Đa, Hà Nội',source:'https://vietnam.travel/things-to-do/11-must-see-attractions-ha-noi'},
    {district:'Ba Đình',name:'Hoàng thành Thăng Long',category:'Di sản',latitude:21.0359,longitude:105.8414,description:'Khu di sản khảo cổ và lịch sử nằm ở trung tâm Hà Nội.',address:'19C Hoàng Diệu, Ba Đình, Hà Nội',source:'https://www.vietnam.travel/things-to-do/hanoi-thang-long-citadel'},
    {district:'Ba Đình',name:'Lăng Chủ tịch Hồ Chí Minh',category:'Lịch sử',latitude:21.0368,longitude:105.8347,description:'Quần thể Quảng trường Ba Đình và khu di tích Chủ tịch Hồ Chí Minh.',address:'2 Hùng Vương, Ba Đình, Hà Nội'},
    {district:'Ba Đình',name:'Chùa Một Cột',category:'Kiến trúc',latitude:21.0359,longitude:105.8336,description:'Ngôi chùa có kiến trúc độc đáo trong quần thể di tích Ba Đình.',address:'Phố Chùa Một Cột, Ba Đình, Hà Nội'},
    {district:'Hoàn Kiếm',name:'Nhà hát Lớn Hà Nội',category:'Kiến trúc',latitude:21.0245,longitude:105.8573,description:'Công trình kiến trúc Pháp và không gian biểu diễn nghệ thuật trung tâm.',address:'1 Tràng Tiền, Hoàn Kiếm, Hà Nội'},
    {district:'Hoàn Kiếm',name:'Di tích Nhà tù Hỏa Lò',category:'Lịch sử',latitude:21.0256,longitude:105.8467,description:'Di tích lịch sử trong khu phố trung tâm Hà Nội.',address:'1 Hỏa Lò, Hoàn Kiếm, Hà Nội'},
    {district:'Long Biên',name:'Cầu Long Biên',category:'Biểu tượng',latitude:21.0437,longitude:105.8588,description:'Cây cầu lịch sử bắc qua sông Hồng, kết nối khu vực nội đô và Long Biên.',address:'Cầu Long Biên, Hà Nội'},
    {district:'Tây Hồ',name:'Hồ Tây',category:'Thiên nhiên',latitude:21.0583,longitude:105.8231,description:'Hồ nước lớn với không gian ven hồ, cảnh quan và ẩm thực.',address:'Khu vực Hồ Tây, Hà Nội'},
    {district:'Tây Hồ',name:'Chùa Trấn Quốc',category:'Tâm linh',latitude:21.0471,longitude:105.8362,description:'Ngôi chùa cổ nằm trên bán đảo phía đông Hồ Tây.',address:'Thanh Niên, Tây Hồ, Hà Nội'},
    {district:'Cầu Giấy',name:'Bảo tàng Dân tộc học Việt Nam',category:'Bảo tàng',latitude:21.0407,longitude:105.7980,description:'Không gian giới thiệu văn hóa của các dân tộc Việt Nam.',address:'Đường Nguyễn Văn Huyên, Cầu Giấy, Hà Nội',source:'https://vietnam.travel/things-to-do/11-must-see-attractions-ha-noi'},
    {district:'Ba Đình',name:'Công viên Thủ Lệ',category:'Công viên',latitude:21.0243,longitude:105.8065,description:'Công viên đô thị có hồ nước, cây xanh và khu vui chơi.',address:'Đường Bưởi, Ba Đình, Hà Nội'},
    {district:'Nam Từ Liêm',name:'Bảo tàng Hà Nội',category:'Bảo tàng',latitude:20.9986,longitude:105.7850,description:'Không gian trưng bày lịch sử, văn hóa và hiện vật của Thủ đô.',address:'Đường Phạm Hùng, Nam Từ Liêm, Hà Nội'},
    {district:'Gia Lâm',name:'Làng gốm Bát Tràng',category:'Làng nghề',latitude:20.9780,longitude:105.9130,description:'Làng nghề gốm truyền thống ven sông Hồng, phù hợp trải nghiệm và mua sắm.',address:'Bát Tràng, Gia Lâm, Hà Nội'},
    {district:'Hoàng Mai',name:'Công viên Yên Sở',category:'Công viên',latitude:20.9652,longitude:105.8685,description:'Công viên sinh thái rộng với hồ nước và không gian dã ngoại.',address:'Vành đai 3, Hoàng Mai, Hà Nội'},
    {district:'Hoài Đức',name:'Thiên đường Bảo Sơn',category:'Khu vui chơi',latitude:20.9946,longitude:105.7342,description:'Tổ hợp vui chơi, trải nghiệm văn hóa và giải trí phía tây Hà Nội.',address:'Đường Lê Trọng Tấn, Hoài Đức, Hà Nội'},
    {district:'Sơn Tây',name:'Làng cổ Đường Lâm',category:'Làng cổ',latitude:21.1585,longitude:105.4695,description:'Làng cổ với nhà đá ong, cổng làng và không gian văn hóa xứ Đoài.',address:'Đường Lâm, Sơn Tây, Hà Nội'},
    {district:'Ba Vì',name:'Vườn quốc gia Ba Vì',category:'Thiên nhiên',latitude:21.0634,longitude:105.3700,description:'Khu bảo tồn núi rừng, khí hậu mát và nhiều tuyến tham quan thiên nhiên.',address:'Ba Vì, Hà Nội'},
    {district:'Mỹ Đức',name:'Khu di tích danh thắng Hương Sơn',category:'Danh thắng',latitude:20.7242,longitude:105.7440,description:'Quần thể danh thắng, chùa và tuyến đi thuyền trong vùng núi đá vôi.',address:'Hương Sơn, Mỹ Đức, Hà Nội'}
  ],
  // Pick a point strictly inside the largest ring; offshore islands do not move it.
  representative(polygons) {
    const area=r=>Math.abs(r.reduce((s,p,i)=>{const q=r[(i+1)%r.length];return s+p[0]*q[1]-q[0]*p[1];},0));
    const ring=polygons.filter(r=>r.length>2).sort((a,b)=>area(b)-area(a))[0];
    if(!ring)return null;
    const ys=ring.map(p=>p[1]),min=Math.min(...ys),max=Math.max(...ys);
    let best=null,width=-1;
    for(let row=1;row<20;row++){
      const y=min+(max-min)*row/20,xs=[];
      ring.forEach((p,i)=>{const q=ring[(i+1)%ring.length];if((p[1]>y)!==(q[1]>y))xs.push(p[0]+(y-p[1])*(q[0]-p[0])/(q[1]-p[1]));});
      xs.sort((a,b)=>a-b);
      for(let i=0;i+1<xs.length;i+=2)if(xs[i+1]-xs[i]>width){width=xs[i+1]-xs[i];best=[(xs[i]+xs[i+1])/2,y];}
    }
    return best||ring[0];
  }
};
