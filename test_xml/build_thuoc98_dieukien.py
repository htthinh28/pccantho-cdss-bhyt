# -*- coding: utf-8 -*-
import os

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ch = open(os.path.join(root, "_thuoc98_chinh.txt"), encoding="utf-8").read().strip()
kt = open(os.path.join(root, "_thuoc98_kt.txt"), encoding="utf-8").read().strip()
bk = chr(92)
jsx_ch = ch.replace(bk, bk + bk)
jsx_kt = kt.replace(bk, bk + bk)
dieukien = (
    "XML2.MA_THUOC == '40.28' AND NOT ((XML1.MA_BENH_CHINH REGEXP '"
    + jsx_ch
    + "') OR (XML1.MA_BENH_KT REGEXP '"
    + jsx_kt
    + "')) AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(THOÁI HÓA KHỚP|THOÁI HOÁ KHỚP|VIÊM XƯƠNG KHỚP|VIÊM KHỚP DẠNG THẤP|VIÊM CỘT SỐNG DÍNH|VIÊM CỘT SỐNG DÍ|ĐAU KHỚP|GÚT|GOUT|BỆNH GÚT)'"
)
out = os.path.join(root, "_dieukien_thuoc98_line.txt")
open(out, "w", encoding="utf-8").write(dieukien)
print("len", len(dieukien))
print(dieukien[:200])
