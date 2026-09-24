'use strict';
// ================= oyun durumu =================
const G={tl:2500,eur:200,card:null,full:70,energy:100,time:9,day:1,tix:{},inv:{simit:0},souv:[],photos:[],done:{},prog:{kedi:0,foto:0,sokak:0},fotoSet:{},tastes:{},
  score:0,shoesOff:false,mode:'walk',ride:null,ui:false,rate:48.5};
const fmt=n=>Math.round(n).toLocaleString('tr-TR')+' ₺';
const $=id=>document.getElementById(id);

// ================= görevler =================
const QUESTS=[
 ['ikart','İstanbulkart edin','İskelelerdeki mavi makinelerden kart al.'],
 ['ayasofya','Ayasofya\'yı ziyaret et','Ayakkabılarını çıkarıp içeri gir, kubbeye bak.'],
 ['sultanahmet','Sultanahmet Camii\'ne gir','Mavi İznik çinilerini gör. Önce avluya, sonra ayakkabılarını çıkar.'],
 ['topkapi','Topkapı Sarayı\'nı gez','Bab-üs Selam kapısında bilet al.'],
 ['hazine','Kaşıkçı Elması\'nı gör','Topkapı\'nın Hazine koğuşunda.'],
 ['yerebatan','Yerebatan\'da Medusa\'yı bul','Sarnıcın en dibinde, ters duran baş.'],
 ['hippodrom','Dikilitaş\'ı incele','At Meydanı\'ndaki 3500 yıllık Mısır obeliski.'],
 ['kapali','Kapalıçarşı\'da pazarlık yap','Halıcıyla pazarlık ederek bir şey satın al.'],
 ['misir','Mısır Çarşısı\'ndan alışveriş','Lokum ya da baharat al.'],
 ['suleymaniye','Süleymaniye Camii\'ni gez','Mimar Sinan\'ın ustalık eseri.'],
 ['balik','Balık ekmek ye','Eminönü rıhtımındaki sallanan teknelerden.'],
 ['galata','Galata Kulesi\'ne çık','Tepeden tüm şehri izle.'],
 ['tram','Nostaljik tramvaya bin','İstiklal Caddesi, Tünel ⇄ Taksim.'],
 ['dondurma','Maraş dondurmacısını yen','Külahı alabilecek misin?'],
 ['ferry','Vapurla Asya\'ya geç','Üsküdar ya da Kadıköy vapuruna bin.'],
 ['simit','Martılara simit at','Vapurun güvertesinde G tuşu.'],
 ['cay','Çay bahçesinde çay iç','İnce belli bardakta, deniz manzarasıyla.'],
 ['kahve','Türk kahvesi iç, fala baktır','Fincanı kapatmayı unutma.'],
 ['kizkulesi','Kız Kulesi\'ne git','Salacak\'tan tekneyle.'],
 ['bogaz','Boğaz turuna çık','Eminönü\'nden; köprünün altından geç.'],
 ['kedi','5 sokak kedisi sev','İstanbul kedilerin şehridir.'],
 ['foto','8 farklı yerin fotoğrafını çek','C ile fotoğraf moduna geç.'],
 ['sokak','3 sokak lezzeti tat','Simit, midye, kokoreç, kestane, kumpir, döner…'],
 ['kostum','Osmanlı kıyafetiyle fotoğraf','Sultanahmet meydanındaki fotoğrafçı.'],
 ['hamam','Türk hamamına git','Çemberlitaş Hamamı, Divan Yolu.'],
 ['dolmabahce','Dolmabahçe Sarayı\'nı gez','Beşiktaş sahilinde.'],
 ['ortakoy','Ortaköy\'de kumpir ye','Camii önünde, Boğaz manzarasıyla.'],
 ['camlica','Çamlıca Tepesi\'ne çık','Anadolu yakasının en yüksek noktası.'],
 ['gece','Gece Galata Köprüsü\'nde yürü','Balıkçılar ve ışıklar…'],
 ['gunbatimi','Gün batımını izle','18:30-19:45 arası su kenarında, vapurda ya da kulede.'],
];
const QN={kedi:5,foto:8,sokak:3};
function done(id){if(G.done[id])return;G.done[id]=true;G.score+=100;const q=QUESTS.find(q=>q[0]===id);UI.toast('✦ Görev tamamlandı: '+(q?q[1]:id),'q');AUD.quest();
  if(Object.keys(G.done).length===QUESTS.length)setTimeout(()=>UI.dialog({title:'Tebrikler, gerçek bir İstanbul sever!',body:'<p>Tüm görevleri bitirdin. Şehir artık senin de şehrin. Yine bekleriz! 🇹🇷</p>',buttons:[{t:'Gezmeye devam',pri:1}]}),1500);}
function prog(id,n=1){G.prog[id]+=n;if(G.prog[id]>=QN[id])done(id);else UI.toast(QUESTS.find(q=>q[0]===id)[1]+': '+G.prog[id]+'/'+QN[id]);}

// ================= arayüz =================
const UI={
 toast(m,c=''){const d=document.createElement('div');d.className='toast card '+c;d.textContent=m;$('toasts').appendChild(d);setTimeout(()=>d.remove(),c==='q'?4200:2800);
  while($('toasts').children.length>4)$('toasts').firstChild.remove();},
 prompt(h){const p=$('prompt');if(!h){p.classList.add('hidden');return;}p.classList.remove('hidden');if(p._h!==h){p.innerHTML=h;p._h=h;}},
 dialog(o){G.ui=true;document.exitPointerLock&&document.exitPointerLock();const d=$('dlg');d.classList.remove('hidden');d.querySelector('h2').textContent=o.title||'';
  d.querySelector('.sub').textContent=o.sub||'';d.querySelector('.body').innerHTML=o.body||'';const b=d.querySelector('.btns');b.innerHTML='';
  for(const x of o.buttons||[{t:'Tamam',pri:1}]){const e=document.createElement('button');e.textContent=x.t;if(x.pri)e.className='pri';if(x.dis)e.disabled=true;
    e.onclick=()=>{if(!x.keep)UI.close();x.fn&&x.fn();};b.appendChild(e);}
  if(o.items)for(const it of o.items){const row=document.createElement('div');row.className='item';row.innerHTML=`<span>${it.n}${it.d?'<br><small style="color:var(--mut)">'+it.d+'</small>':''}</span>`;
    const r=document.createElement('span');r.style.display='flex';r.style.gap='8px';r.style.alignItems='center';r.innerHTML=`<span class="p">${it.p?fmt(it.p):'ikram'}</span>`;
    for(const a of it.acts||[{t:'Al'}]){const e=document.createElement('button');e.textContent=a.t;e.onclick=()=>{if(a.fn(it)!==false&&!a.stay)UI.close();};r.appendChild(e);}
    row.appendChild(r);d.querySelector('.body').appendChild(row);}},
 close(){$('dlg').classList.add('hidden');G.ui=false;},
 float(t,x,y,z){const s=Game.project(x,y,z);if(!s)return;const d=document.createElement('div');d.className='flt';d.textContent=t;d.style.left=s[0]+'px';d.style.top=s[1]+'px';$('labels').appendChild(d);setTimeout(()=>d.remove(),1400);},
};

// ================= para =================
function pay(n,card=false){if(card){if(G.card===null){UI.toast('İstanbulkart\'ın yok! İskeledeki mavi makineden al.','bad');return false;}
  if(G.card<n){UI.toast('Kart bakiyesi yetersiz ('+fmt(G.card)+'). Makineden yükle.','bad');return false;}G.card-=n;AUD.cash();return true;}
  if(G.tl<n){UI.toast('Yeterli nakit yok! Döviz bürosunda € bozdurabilirsin.','bad');return false;}G.tl-=n;AUD.cash();return true;}
function eat(full,en=0,taste){G.full=clamp(G.full+full,0,100);G.energy=clamp(G.energy+en,0,100);
  if(taste&&!G.tastes[taste]){G.tastes[taste]=1;prog('sokak');}}
function addTime(h){G.time+=h;while(G.time>=24){G.time-=24;G.day++;}G.full=clamp(G.full-h*4,0,100);}

// ================= bilgi kartları =================
const INFO={
 ayasofya:['Ayasofya','537 · Bizans / Osmanlı','Justinianus\'un yaptırdığı bu yapı neredeyse bin yıl dünyanın en büyük kilisesiydi. 31 metrelik kubbesi "gökten sarkan bir zincirle asılı" gibi görünür. 1453\'te camiye, 1934\'te müzeye, 2020\'de yeniden camiye dönüştürüldü. Dev yeşil madalyonlarda Allah, Hz. Muhammed ve dört halifenin adları yazar.'],
 sultanahmet:['Sultanahmet Camii','1616 · Sedefkâr Mehmed Ağa','Altı minaresiyle ünlü "Mavi Cami". İçeriyi süsleyen 20.000\'den fazla İznik çinisi ona adını verir. Dört dev "fil ayağı" sütun merkezi kubbeyi taşır.'],
 suleymaniye:['Süleymaniye Camii','1557 · Mimar Sinan','Kanuni Sultan Süleyman için yapılan külliye; Sinan\'ın "kalfalık eserim" dediği yapı. Akustiği o kadar iyidir ki imamın sesi mikrofonsuz her köşeye ulaşır. Dört minaresindeki on şerefe, Kanuni\'nin onuncu padişah oluşunu simgeler.'],
 topkapi:['Topkapı Sarayı','1478 · Fatih Sultan Mehmed','Yaklaşık 400 yıl Osmanlı padişahlarının evi ve devletin yönetim merkezi. Avlular, Harem, Divan-ı Hümayun ve Adalet Kulesi\'ni gez. Arka taraftaki köşklerden Boğaz, Haliç ve Marmara bir arada görünür.'],
 hazine:['Hazine-i Âmire','Enderun Hazinesi','86 karatlık Kaşıkçı Elması, bir balıkçının çöplükte bulup üç kaşık karşılığında sattığı rivayet edilen taştır. Yanında zümrüt kakmalı Topkapı Hançeri parlıyor. 💎'],
 bagdat:['Bağdat Köşkü','1639 · IV. Murad','Bağdat Seferi\'nin anısına yapılan köşk. İznik çinileri, sedef kapıları ve Haliç\'e bakan eşsiz terasıyla sarayın en zarif köşesi.'],
 yerebatan:['Yerebatan Sarnıcı','532 · Justinianus','336 sütunlu bu yeraltı sarayı, Büyük Saray\'a su taşımak için yapıldı. Loş ışıkta sütunlar suya yansır, sazanlar süzülür. En dipte, biri ters biri yan duran iki Medusa başı seni bekliyor.'],
 medusa:['Medusa Başları','Roma dönemi','Neden ters ve yan konduklarını kimse kesin bilmiyor: Biri bakışının taşa çevirme gücünü yok etmek için, diğeri sadece sütuna uysun diye. Bakmaktan korkma, taşa dönüşmezsin. 🐍'],
 hippodrom:['At Meydanı & Dikilitaş','MÖ 1490 · Firavun III. Tutmosis','Mısır\'daki Karnak Tapınağı\'ndan getirilen obelisk 3500 yaşında! Hemen yanında Delfi\'den gelen bronz Yılanlı Sütun ve taşları sökülmüş Örme Dikilitaş var. Bizans\'ta burada araba yarışları yapılırdı.'],
 galata:['Galata Kulesi','1348 · Cenevizliler','67 metrelik kule, 17. yüzyılda Hezârfen Ahmed Çelebi\'nin kendi yaptığı kanatlarla buradan Üsküdar\'a uçtuğu efsanesiyle ünlü. Balkondan Tarihi Yarımada, Haliç ve Boğaz görünür.'],
 dolmabahce:['Dolmabahçe Sarayı','1856 · Balyan ailesi','Avrupa tarzındaki bu saray 285 oda, 46 salon ve 4,5 tonluk dev bir kristal avizeye sahip. Atatürk 10 Kasım 1938\'de burada hayata gözlerini yumdu; odasındaki saatler hâlâ 09.05\'i gösterir.'],
 kizkulesi:['Kız Kulesi','Antik çağdan bugüne','Efsaneye göre kızının yılan sokmasıyla öleceği kehanetini duyan kral onu bu kuleye kapattı; ama yılan bir üzüm sepetinde geldi… Kule deniz feneri, karantina istasyonu ve gümrük binası olarak kullanıldı.'],
 camlica:['Çamlıca Tepesi','Anadolu yakası','İstanbul\'un en yüksek noktalarından biri. Buradan iki kıta, Boğaz köprüleri ve Adalar görünür. Tepedeki Çamlıca Camii Türkiye\'nin en büyük camisidir.'],
 taksim:['Taksim Cumhuriyet Anıtı','1928 · Pietro Canonica','Kurtuluş Savaşı ve Cumhuriyet\'in kuruluşunu anlatan anıt. "Taksim" adı, şehre gelen suyun buradan dağıtıldığı (taksim edildiği) maksemden gelir.'],
 haydarpasa:['Haydarpaşa Garı','1909','Anadolu\'dan İstanbul\'a gelen trenlerin son durağı. Deniz kenarındaki bu masalsı Alman neo-klasik bina yıllarca şehre gelenlerin ilk gördüğü yer oldu.'],
 rumeli:['Rumeli Hisarı','1452 · Fatih Sultan Mehmed','Sadece 4,5 ayda inşa edilen hisar, fetihten önce Boğaz\'ı kontrol etmek için yapıldı. Karşısında Anadolu Hisarı durur.'],
};
function info(k,extra=''){const i=INFO[k];UI.dialog({title:i[0],sub:i[1],body:'<p>'+i[2]+'</p>'+extra});}

// ================= dükkânlar =================
function shopDlg(title,sub,items,body=''){UI.dialog({title,sub,body,items,buttons:[{t:'Kapat'}]});}
const buyEat=(it,full,en,taste,q)=>{if(!pay(it.p))return false;eat(full,en,taste);UI.toast('Afiyet olsun! '+it.n);if(q)done(q);};
const SHOPS={
 simit(){shopDlg('Simitçi','"Taze simit, sıcak simiiit!"',[{n:'Susamlı simit',p:20,acts:[{t:'Hemen ye',fn:it=>buyEat(it,15,2,'simit')},{t:'Çantaya koy',fn:it=>{if(!pay(it.p))return false;G.inv.simit++;UI.toast('Çantada '+G.inv.simit+' simit var. Martılar için: G');}}]},
  {n:'Poğaça',p:25,acts:[{t:'Ye',fn:it=>buyEat(it,15,0)}]}]);},
 cay(s){shopDlg(s.n,'Denize karşı, ince belli bardakta',[{n:'Demli çay',p:25,d:'Otur, manzarayı izle (+20 dk)',acts:[{t:'İç',fn:it=>{if(!pay(it.p))return false;Game.sit(s,()=>{eat(0,18);addTime(.33);done('cay');UI.toast('Oh be! Çay gibisi yok. ☕');});}}]},
  {n:'Salep',p:70,acts:[{t:'İç',fn:it=>buyEat(it,5,10)}]},{n:'Tavla oyna (1 saat)',p:0,acts:[{t:'Oyna',fn:()=>{Game.fade(()=>{addTime(1);UI.toast(Math.random()<.5?'Tavlada kazandın: "Şeş beş!" 🎲':'Amca seni mars etti. 🎲');});}}]}]);},
 carsicay(){if(!G.tastes.carsicay){G.tastes.carsicay=1;eat(0,10);done('cay');UI.dialog({title:'Çay ocağı',body:'<p>Esnaftan biri gülümseyerek tepsiyle çay uzatıyor: <i>"Buyur abla/abi, bizden ikram!"</i> ☕</p>'});}else UI.toast('"Bir çay daha? Ayıp olmaz ya!" ☕');},
 balik(){shopDlg('Balık Ekmek','Sallanan Osmanlı kayıklarından',[{n:'Balık ekmek (uskumru)',p:200,acts:[{t:'Ye',fn:it=>buyEat(it,45,5,'balik','balik')}]},{n:'Turşu suyu',p:40,acts:[{t:'İç',fn:it=>buyEat(it,5,5)}]}]);},
 doner(){shopDlg('Dönerci','"Ustam, bir yarım ekmek!"',[{n:'Tavuk döner dürüm',p:180,acts:[{t:'Ye',fn:it=>buyEat(it,40,5,'doner')}]},{n:'Et döner porsiyon',p:280,acts:[{t:'Ye',fn:it=>buyEat(it,55,5,'doner')}]},{n:'Ayran',p:30,acts:[{t:'İç',fn:it=>buyEat(it,5,8)}]}]);},
 kumpir(){shopDlg('Kumpirci','Ortaköy\'ün meşhur kumpiri',[{n:'Karışık kumpir',p:280,d:'Mısır, turşu, zeytin, sosis, rus salatası…',acts:[{t:'Ye',fn:it=>buyEat(it,60,0,'kumpir','ortakoy')}]},{n:'Waffle',p:220,acts:[{t:'Ye',fn:it=>buyEat(it,30,5)}]}]);},
 midye(){shopDlg('Midyeci','"Limonlu, limonlu!"',[{n:'10 midye dolma',p:150,acts:[{t:'Ye',fn:it=>buyEat(it,30,0,'midye')}]}]);},
 kestane(){shopDlg('Kestaneci','Közde kestane kokusu',[{n:'Kese kestane',p:150,acts:[{t:'Ye',fn:it=>buyEat(it,20,5,'kestane')}]},{n:'Közde mısır',p:80,acts:[{t:'Ye',fn:it=>buyEat(it,20,0,'misir')}]}]);},
 kokorec(){shopDlg('Kokoreççi','Kadıköy gece klasiği',[{n:'Yarım ekmek kokoreç',p:220,acts:[{t:'Ye',fn:it=>buyEat(it,40,0,'kokorec')}]}]);},
 bufe(){shopDlg('Büfe','',[{n:'Su',p:15,acts:[{t:'İç',fn:it=>buyEat(it,0,6)}]},{n:'Ayran',p:30,acts:[{t:'İç',fn:it=>buyEat(it,5,8)}]},{n:'Kaşarlı tost',p:120,acts:[{t:'Ye',fn:it=>buyEat(it,30,0,'tost')}]}]);},
 kahve(s){shopDlg(s.n,'Kırk yıl hatırı olan fincan',[{n:'Türk kahvesi (orta)',p:110,d:'Yanında lokum ve su',acts:[{t:'İç',fn:it=>{if(!pay(it.p))return false;eat(3,20);setTimeout(fal,50);}}]},{n:'Oralet',p:40,acts:[{t:'İç',fn:it=>buyEat(it,2,8)}]}]);},
 doviz(){const b=[20,50,100,G.eur].filter((v,i,a)=>v>0&&v<=G.eur&&a.indexOf(v)===i);UI.dialog({title:'Döviz Bürosu',sub:'1 € = '+G.rate.toLocaleString('tr-TR')+' ₺ (komisyonsuz!)',body:`<p>Cüzdanında <b>${G.eur} €</b> ve <b>${fmt(G.tl)}</b> var.</p>`,
  buttons:[...b.map(v=>({t:v+' € boz',fn:()=>{G.eur-=v;G.tl+=v*G.rate;AUD.cash();UI.toast(v+' € → '+fmt(v*G.rate));}})),{t:'Kapat'}]});},
 ikart(){if(G.card===null){UI.dialog({title:'İstanbulkart Makinesi',body:'<p>Tüm vapur, tramvay, metro ve otobüslerde geçerli. Kart ücreti 150 ₺ (içinde bakiye yok).</p>',buttons:[{t:'Kart al (150 ₺)',pri:1,fn:()=>{if(pay(150)){G.card=0;done('ikart');setTimeout(SHOPS.ikart,100);}}},{t:'Vazgeç'}]});return;}
  UI.dialog({title:'İstanbulkart Makinesi',body:`<p>Kart bakiyesi: <b>${fmt(G.card)}</b> · Nakit: <b>${fmt(G.tl)}</b></p><p>Bir biniş: 27 ₺</p>`,buttons:[...[100,250,500].map(v=>({t:'+'+v+' ₺ yükle',fn:()=>{if(pay(v)){G.card+=v;UI.toast('Kart bakiyesi: '+fmt(G.card));}}})),{t:'Kapat'}]});},
 dondurma:()=>dondurma(),hali:()=>pazarlik(),
 nazar(){shopDlg('Nazar Boncukçusu','"Buyrun bakmak bedava!"',[{n:'Nazar boncuğu',p:80,acts:[{t:'Al',fn:souv}]},{n:'Nazarlı anahtarlık',p:120,acts:[{t:'Al',fn:souv}]},{n:'Çini tabak',p:650,acts:[{t:'Al',fn:souv}]}]);},
 lamba(){shopDlg('Lambacı','Renk renk mozaik lambalar',[{n:'Mozaik masa lambası',p:1400,acts:[{t:'Al',fn:souv}]},{n:'Asma mozaik fener',p:2200,acts:[{t:'Al',fn:souv}]}]);},
 kuyumcu(){UI.dialog({title:'Kuyumcu',body:'<p>Vitrinde altın bilezikler, sultan yüzükleri pırıl pırıl… Kuyumcu gözlüklerinin üstünden bakıyor: <i>"Bakmakla bir şey olmaz, ama bir çay içersiniz değil mi?"</i></p>',items:[{n:'Gümüş Osmanlı yüzüğü',p:1800,acts:[{t:'Al',fn:souv}]}],buttons:[{t:'Sadece bakıyorum'}]});},
 baharat(){shopDlg('Baharatçı','Mısır Çarşısı · koku cenneti',[{n:'İran safranı (1 gr)',p:350,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Urfa isot',p:90,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Sumak',p:80,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Nar ekşisi',p:120,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]}]);},
 lokum(){shopDlg('Lokumcu','"Buyrun tadına bakın!" (bir parça ikram)',[{n:'Fıstıklı lokum (500 g)',p:300,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Gül lokumu',p:180,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Çifte kavrulmuş',p:320,acts:[{t:'Al',fn:it=>{if(souv(it)!==false)done('misir');}}]},{n:'Tadına bak',p:0,acts:[{t:'Tat',fn:()=>{eat(4,2,'lokum');UI.toast('Mmm, ağızda dağılıyor! 🍬');}}]}]);},
 kostum(){UI.dialog({title:'Osmanlı Fotoğrafçısı',body:'<p>"Kaftanı giy, fesi tak, sultan ol! Hatıra fotoğrafı sadece 400 ₺."</p>',buttons:[{t:'Fotoğraf çektir (400 ₺)',pri:1,fn:()=>{if(pay(400))Game.selfie('Sultan kıyafetiyle hatıra fotoğrafı',()=>done('kostum'));}},{t:'Vazgeç'}]});},
 hamam(){UI.dialog({title:'Çemberlitaş Hamamı',sub:'1584 · Mimar Sinan',body:'<p>Göbek taşında terle, tellak keseyle yorgunluğunu alsın, köpük masajıyla bulutlar gibi ol. (1,5 saat)</p>',buttons:[{t:'Kese + köpük (1500 ₺)',pri:1,fn:()=>{if(pay(1500))Game.fade(()=>{addTime(1.5);G.energy=100;done('hamam');UI.dialog({title:'Tertemiz!',body:'<p>Tellak "Sıhhatler olsun!" diyor. Kendini yeniden doğmuş gibi hissediyorsun. Enerji tam! 🧖</p>'});});}},{t:'Vazgeç'}]});},
 otel(){UI.dialog({title:'Otel Sultanahmet',body:'<p>Odan hazır. Yarın sabah 08:00\'e kadar uyumak ister misin?</p>',buttons:[{t:'Uyu 😴',pri:1,fn:()=>Game.fade(()=>{const h=(24-G.time+8)%24||24;G.time=8;G.day++;G.full=clamp(G.full-10,0,100);G.energy=100;UI.toast('Günaydın! Kahvaltıda simit, peynir, zeytin, çay… (Gün '+G.day+')');eat(40,0);},1500)},{t:'Vazgeç'}]});},
};
function souv(it){if(!pay(it.p))return false;G.souv.push(it.n);UI.toast('Çantaya eklendi: '+it.n+' 🛍️');}

// ================= mini oyunlar =================
const FALS=['Fincanında büyük bir kuş var: yakında güzel bir haber alacaksın.','Yolun açık görünüyor; uzun bir yolculuk ama dönüşü güzel.','Kalbinde bir ağırlık var ama üç vakte kadar ferahlayacaksın.',
 'Bir göz değmiş sana, nazar boncuğu taşımayı unutma!','Fincanın dibinde para var; kısmetin açılıyor.','Bir balık görüyorum… Ya çok şanslısın ya da akşam balık yiyeceksin.',
 'Seni düşünen biri var, adı "M" ile başlıyor olabilir.','Önünde iki yol var; sağdakini seç, İstanbul seni tekrar çağıracak.','Dağ gibi bir engel görünüyor ama arkasında güneş var.'];
function fal(){UI.dialog({title:'Türk Kahvesi',body:'<p>Kahveni yudum yudum içtin, telvesi kaldı. Garson fincanı tabağa kapatıp soğumasını bekliyor…</p>',buttons:[{t:'Falıma bak 🔮',pri:1,fn:()=>{done('kahve');
  UI.dialog({title:'Fal',sub:'Kahveci teyze fincana bakıyor',body:'<p><i>"'+FALS[Math.floor(Math.random()*FALS.length)]+'"</i></p><p style="color:var(--mut);font-size:12px">"Fala inanma, falsız da kalma."</p>'});}},{t:'Gerek yok'}]});}
function dondurma(){let n=0;const tricks=['Külahı uzattı… ve son anda ters çevirip geri çekti! 😅','Dondurma sopanın ucunda sana doğru geliyor… ama elinde sadece boş külah kaldı!','Zili çaldı, dikkatin dağıldı, dondurma yine onun elinde! 🔔','Külahı başına şapka gibi taktı. Herkes gülüyor. 🙃'];
 const step=()=>{UI.dialog({title:'Maraş Dondurmacısı',sub:'Fesli usta sopayı çeviriyor',body:'<p>'+(n?tricks[(n-1)%tricks.length]:'"Buyrun! Kaymaklı mı, fıstıklı mı?" Usta dondurmayı uzatıyor…')+'</p>',
  buttons:[{t:n<3?'Kap! 🍦':'Bu sefer kap! 🍦',pri:1,fn:()=>{n++;if(n>=4||Math.random()<.12*n){if(pay(120)){done('dondurma');eat(12,5,'dondurma');UI.dialog({title:'Başardın!',body:'<p>Usta gülerek sonunda dondurmayı veriyor: <i>"Helal olsun!"</i> Uzayan, sakızlı Maraş dondurması tam bir lezzet. 🍦</p>'});}}else step();}},{t:'Pes et'}]});};step();}
function pazarlik(){const items=[['El dokuması Hereke halısı',16000],['Kilim',5500],['Yastık kılıfı',900]];
 UI.dialog({title:'Halıcı',sub:'"Hoş geldiniz! Bir çay söyleyelim mi?"',body:'<p>Halıcı dükkanın dört bir yanına halıları sermeye başlıyor. Hangisiyle ilgileniyorsun?</p>',buttons:[...items.map(([n,p])=>({t:n,fn:()=>haggle(n,p)})),{t:'Sadece bakıyorum'}]});}
function haggle(name,ask){const min=Math.round(ask*(.5+Math.random()*.15)/50)*50;let cur=ask,pat=3;
 const round=(msg)=>{const offs=[.45,.6,.75].map(k=>Math.round(cur*k/50)*50);
  UI.dialog({title:name,sub:'Sabır: '+'😊'.repeat(pat)+'😠'.repeat(3-pat),body:`<p>${msg}</p><p>Satıcının istediği: <b style="color:var(--gold)">${fmt(cur)}</b></p><p style="color:var(--mut);font-size:12px">İpucu: İlk fiyata asla evet deme. Çok düşük teklif satıcıyı kızdırır.</p>`,
   buttons:[...offs.map(o=>({t:'Teklif: '+fmt(o),fn:()=>offer(o)})),{t:'Tamam, '+fmt(cur),pri:1,fn:()=>buy(cur)},{t:'Vazgeç, çık',fn:()=>{UI.toast('Kapıdan çıkarken: "Tamam tamam, son fiyat!" diye sesleniyor… ama çıktın.');}}]});};
 const buy=p=>{if(!pay(p)){return;}G.souv.push(name);done('kapali');UI.dialog({title:'Hayırlı olsun!',body:`<p><b>${name}</b> ${fmt(p)}'ye senin oldu. ${p<=min*1.15?'Satıcı başını sallıyor: <i>"Siz bu işi biliyorsunuz!"</i> Harika pazarlık! 🏆':p>=ask*.9?'Satıcı çok mutlu görünüyor… belki biraz fazla ödedin. 😉':'Güzel bir alışveriş!'}</p>`});};
 const offer=o=>{if(o>=min){if(o<cur*.6&&Math.random()<.5){cur=Math.round((cur+o)/2/50)*50;round('"Olmaz abi, bu el dokuması! Ama sana özel…"');return;}buy(o);return;}
  if(o<min*.75){pat--;if(pat<=0){UI.dialog({title:'Olmadı…',body:'<p>Satıcı çayını bırakıp "Başka dükkana bakın!" diyor. Pazarlık bitti. 😤</p>'});return;}
   cur=Math.max(min,Math.round((cur-(cur-o)*.15)/50)*50);round('"Abi bu fiyata ipini bile vermem! Kırk yıllık esnafım ben!"');return;}
  cur=Math.max(min,Math.round((cur-(cur-o)*.4)/50)*50);round(['"Hmm… Senin hatırın için biraz inerim."','"Bak kardeşim, ben zararına satıyorum ama…"','"Tamam, son fiyat. Allah bereket versin."'][Math.floor(Math.random()*3)]);};
 round('"Bu çok özel bir parça. Sana '+fmt(ask)+' diyelim."');}

// ================= etkileşim noktaları =================
const MOSQ={ayasofya:'Ayasofya',sultanahmet:'Sultanahmet Camii',suleymaniye:'Süleymaniye Camii',yenicami:'Yeni Cami',mihrimah:'Mihrimah Sultan Camii',ortakoy:'Ortaköy Camii',camlica:'Çamlıca Camii',taksimcami:'Taksim Camii'};
const SPOTLBL={simit:'Simit al',cay:'Çay bahçesi',balik:'Balık ekmek',dondurma:'Maraş dondurması',doner:'Döner',kumpir:'Kumpir',kahve:'Türk kahvesi',doviz:'Döviz bürosu',ikart:'İstanbulkart makinesi',
 midye:'Midye dolma',kestane:'Kestane',bufe:'Büfe',kokorec:'Kokoreç',kostum:'Osmanlı fotoğrafçısı',hali:'Halıcı',nazar:'Nazar boncukçusu',lamba:'Lambacı',kuyumcu:'Kuyumcu',carsicay:'Çay ocağı',baharat:'Baharatçı',lokum:'Lokumcu'};
const INTER=[];
const ACT={
 init(){for(const s of SPOTS)INTER.push({x:s.x,z:s.z,r:s.t==='cay'?5:s.ng?2.6:3.2,l:()=>SPOTLBL[s.t],fn:()=>SHOPS[s.t](s)});
  INTER.push({x:-40,z:180,r:3.5,l:()=>'Çemberlitaş Hamamı',fn:SHOPS.hamam},{x:-52,z:290,r:3.5,l:()=>'Otele gir',fn:SHOPS.otel});
  for(const it of INTERIORS)if(MOSQ[it.key]){const d=it.hd+3.4,x=it.x-it.s*d,z=it.z-it.c*d;it.door=[x,z];
    INTER.push({x,z,r:3.5,l:()=>G.shoesOff?null:MOSQ[it.key]+': ayakkabılarını çıkar',fn:()=>{G.shoesOff=true;UI.toast('Ayakkabılarını çıkarıp poşete koydun. 👟');}});}
  const site=(x,z,r,k,extra)=>INTER.push({x,z,r,l:()=>INFO[k][0]+' hakkında',fn:()=>{info(k);extra&&extra();}});
  site(-15,236,6,'hippodrom',()=>done('hippodrom'));site(-200,-730,9,'taksim');site(700,393,8,'haydarpasa');site(277,83,5,'bagdat');
  site(286,50,4,'hazine',()=>done('hazine'));
  INTER.push({x:181,z:45,r:4,l:()=>G.tix.topkapi?null:'Topkapı Sarayı bileti (1500 ₺)',fn:()=>ticket('topkapi',1500,()=>UI.toast('Bab-üs Selam kapısından geçebilirsin.'))});
  INTER.push({x:245,z:-620,r:5,l:()=>'Dolmabahçe Sarayı (1200 ₺)',fn:()=>ticket('dolmabahce',1200,()=>{info('dolmabahce');done('dolmabahce');},true)});
  INTER.push({x:10,z:-289.5,r:3.5,l:()=>G.mode==='walk'?'Galata Kulesi\'ne çık (900 ₺)':null,fn:()=>ticket('galata',900,()=>Game.galataUp(),true)});
  INTER.push({x:76,z:135,r:3.5,l:()=>'Yerebatan Sarnıcı\'na in (800 ₺)',fn:()=>ticket('yerebatan',800,()=>Game.cisternIn(),true)});
  INTER.push({x:CIS.x+28.6,z:CIS.z-14,y:CIS.y,r:4,l:()=>'Medusa başlarına bak',fn:()=>{info('medusa');done('yerebatan');}});
  INTER.push({x:CIS.x-31,z:CIS.z+2.4,y:CIS.y,r:4,l:()=>'Yukarı çık',fn:()=>Game.cisternOut()});
  INTER.push({x:555,z:52,y:1.3,r:6,l:()=>'Kız Kulesi hakkında',fn:()=>{info('kizkulesi');done('kizkulesi');}});},
 scan(P){let best=null,bd=1e9;for(const i of INTER){const d=Math.hypot(P.x-i.x,P.z-i.z);if(d<i.r&&d<bd&&(i.y!==undefined?Math.abs(P.y-i.y)<5:Math.abs(P.y-groundY(i.x,i.z))<6)){const l=i.l();if(l){best={l,fn:i.fn};bd=d;}}}
  const dyn=Game.dynamicInteract(P);if(dyn&&(!best||dyn.pri))return dyn;return best;},
};
function ticket(k,price,after,always){if(G.tix[k]&&!always){after();return;}
 if(G.tix[k]){after();return;}UI.dialog({title:'Bilet gişesi',body:`<p>${LM[k]?LM[k].n:''} giriş bileti: <b>${fmt(price)}</b></p>`,buttons:[{t:'Bilet al',pri:1,fn:()=>{if(pay(price)){G.tix[k]=true;after();}}},{t:'Vazgeç'}]});}

// ================= günlük =================
function journal(tab='q'){const J=$('journal');J.classList.remove('hidden');G.ui=true;document.exitPointerLock&&document.exitPointerLock();
 J.querySelectorAll('.tabs button[data-t]').forEach(b=>{b.classList.toggle('on',b.dataset.t===tab);b.onclick=()=>journal(b.dataset.t);});$('jclose').onclick=()=>{J.classList.add('hidden');G.ui=false;};
 const P=J.querySelector('.pane');
 if(tab==='q'){const n=Object.keys(G.done).length;P.innerHTML=`<p>Tamamlanan: <b style="color:var(--gold)">${n} / ${QUESTS.length}</b> · Gezgin puanı: <b>${G.score+G.photos.length*10}</b></p>`+
   QUESTS.map(q=>`<div class="qrow ${G.done[q[0]]?'done':''}"><div class="ck">${G.done[q[0]]?'✅':'⬜'}</div><div><b>${q[1]}</b>${QN[q[0]]?` (${Math.min(G.prog[q[0]],QN[q[0]])}/${QN[q[0]]})`:''}<br><small>${q[2]}</small></div></div>`).join('');}
 if(tab==='i'){P.innerHTML=`<p>💵 Nakit: <b>${fmt(G.tl)}</b> · 💶 <b>${G.eur} €</b> · 💳 İstanbulkart: <b>${G.card===null?'yok':fmt(G.card)}</b></p>
   <p>🥯 Simit: <b>${G.inv.simit}</b> ${G.inv.simit?'<button id="eatS">Bir tane ye</button>':''}</p><h3 style="color:var(--gold)">Hediyelikler</h3>${G.souv.length?'<ul>'+G.souv.map(s=>'<li>'+s+'</li>').join('')+'</ul>':'<p style="color:var(--mut)">Henüz bir şey almadın.</p>'}
   <h3 style="color:var(--gold)">Tattıkların</h3><p>${Object.keys(G.tastes).join(', ')||'—'}</p>`;const e=$('eatS');if(e)e.onclick=()=>{G.inv.simit--;eat(15,2,'simit');journal('i');};}
 if(tab==='a'){P.innerHTML=G.photos.length?'<div class="album">'+G.photos.map(p=>`<figure><img src="${p.img}"><figcaption><b>${p.n}</b><br><small>Gün ${p.d} · ${p.t}</small></figcaption></figure>`).join('')+'</div>':'<p style="color:var(--mut)">Albüm boş. C tuşuyla fotoğraf moduna geç ve bir simgeyi kadraja al.</p>';}
 if(tab==='h'){P.innerHTML=`<p><span class="k">WASD</span> yürü, <span class="k">Shift</span> koş, <span class="k">Boşluk</span> zıpla, fare ile bak (ekrana tıkla).</p><p><span class="k">E</span> satıcılar, bilet gişeleri, iskeleler, kediler ve bilgi noktalarıyla etkileşim. Vapur ve tramvaydan inmek için de E.</p>
  <p><span class="k">C</span> fotoğraf modu: kadraja bir simge al, <span class="k">F</span> ya da tıkla. Fare tekeri yakınlaştırır.</p><p><span class="k">M</span> harita: bir yere tıkla ya da listeden seç, taksiyle git.</p><p><span class="k">G</span> çantadaki simidi fırlat — martılar kapar!</p><p><span class="k">N</span> saati 1 saat ileri al · <span class="k">B</span> müzik aç/kapat · <span class="k">V</span> kamera.</p>
  <p>İpuçları: Camiye girmeden önce kapıda ayakkabılarını çıkar. Vapur ve tramvay için İstanbulkart gerekir. Nakit bitince döviz bürosu Sultanahmet'te. Acıkınca enerjin düşer.</p>`;}}
