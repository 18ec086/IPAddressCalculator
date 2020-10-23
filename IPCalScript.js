//サブネットビット長からサブネットマスクの計算(返却:10進数int)
function subnetBit(num){
    var subnet=new Array(4);
    var cnt=1;
    for(var i=0;i<4;i++){
        subnet[i]="";
        for(var j=1;j<=8;j++){
            subnet[i]+= cnt<=num?1:0;
            cnt++;
        }
        subnet[i]=parseInt(subnet[i],2);
    }
    return subnet;
}

//ネットワークアドレスを計算(返却値:String)
function calIP(strIP,num){
    //var num=24;
    var IP=strIP.split('.');
    var sub=subnetBit(num);
    var A=new Array(IP.length);
    for(var i=0;i<IP.length;i++){
        A[i]=parseInt(IP[i])&sub[i];
    }
    return A.join('.');
}
//length1桁になるように左を0で埋める
function zeroPadding(num,length){
    return (Array(length).join("0")+num).slice(-length);
}

//文字列で書かれたIPアドレスをnum進法に変換(返却値:String)
function toSystems(strIP,num){
    var x=strIP.split('.');
    var A=new Array(x.length);
    for(var i=0;i<x.length;i++){
        //console.log(x[i]);
        A[i]=parseInt(x[i]).toString(num);//10to10 or 2to2
        if(num==2)A[i]=zeroPadding(A[i].toString(2),8);//2to2
        
    }
    return A.join('.');
}

//変換ボタンが押された場合の動作
function ClickedButton(){
    var ip=document.querySelector('input[name="IP"]').value;//IP Adress
    if(ip!=""){
        var num=parseInt(document.getElementById("subLength").value);//サブネットマスク長
        ip=ip.replace(/^s+|s+$/,"");
        var regex=/^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        if(regex.test(ip)){
            var A=calIP(ip,num);//ネットワークアドレス
            
            var n=10;
            //どのラジオボタンが押されているかを確認
            const n_systems=document.getElementsByName("systems");
            var i=0
             for(i=0;i<n_systems.length;i++){
                if(n_systems[i].checked){
                    n=parseInt(n_systems[i].value);
                    break;
                }
            }
            document.querySelector('input[name="NetIP"]').value=toSystems(A,n);//テキストボックスに代入
           
            
            var data=[["IPアドレス:",ip],
                      ["サブネットマスク:","/"+num],
                      ["ネットワークアドレス:",toSystems(A,n)],
                      ["クラス:",judgeClass(A)],
                      ["ホストアドレス:",hostIP_start(A,num,n)+"~"+hostIP_end(ip,num,n)],
                      ["ブロードキャストアドレス:",broadCastIP(A,num,n)],
                      ["アドレス数:","IPアドレス数:"+numIP(A,num)+"(ホストアドレス数:"+numHost(A,num)+")"]
                    ];
            delTable("table");
            maketable(data,"table");
    
        }
        else {
            alert("IPv4アドレスの形で入力してください");
            document.querySelector('input[name="IP"]').value="";
        } 
    }
}


function hostIP_start(strIP,n,n_systems){
    var A=calIP(strIP,n);
    //console.log(A);
    var B=new Array(4);
    var s=toSystems(A,2).split('.');
    var x="";
    for(i=0;i<4;i++){
        x+=s[i];
    }
    //console.log(x);
    var y=(parseInt(x,2)+1).toString(2);
    y=zeroPadding(y,32);
    //console.log("y",y);
    cnt=0;
    for(i=0;i<4;i++){
        B[i]="";
        for(j=0;j<8;j++){
            B[i]+=y[cnt++];
        }
        //console.log(i,B[i]);
        if(n_systems==2)B[i]=zeroPadding(B[i],8);
        else if(n_systems==16)B[i]=parseInt(B[i],2).toString(16);
        else if(n_systems==10)B[i]=parseInt(B[i],2);
        
    }  
    return B.join('.');
}
//console.log(hostIP_start("100.100.100.100",3,10));
function hostIP_end(strIP,n,n_systems){
    var A=broadCastIP(strIP,n,2);
    //console.log(A);
    var B=new Array(4);
    var s= A.split('.');
    var x="";
    for(i=0;i<4;i++){
        x+=s[i];
    }
    //console.log(x);
    var y=(parseInt(x,2)-1).toString(2);
    y=zeroPadding(y,32);
    cnt=0;
    for(i=0;i<4;i++){
        B[i]="";
        for(j=0;j<8;j++){
            B[i]+=y[cnt++];
        }
        if(n_systems==10)B[i]=parseInt(B[i],2);
        else if(n_systems==16)B[i]=parseInt(B[i],2).toString(16);
        //console.log(B[i].toString(16));
    }  
    return B.join('.');
}
//console.log(hostIP_end("192.168.1.1",24,2));
function broadCastIP(strIP,n,n_systems){
    var x=calIP(strIP,n);
    var sub=subnetBit(n);
    var A=x.split('.');
    var s="";
    var t="";
    for(i=0;i<A.length;i++){
        s+=zeroPadding(parseInt(A[i]).toString(2),8);
        t+=zeroPadding(parseInt(sub[i]).toString(2),8);
    }
    cnt=0;
    for(i=0;i<A.length;i++){
       A[i]="";
        for(j=0;j<8;j++){
            A[i]+=cnt<n?s[cnt]&t[cnt]:1;
            cnt++;
       }
        //console.log(A[i]);
        if(n_systems==16)A[i]=parseInt(A[i],2).toString(16);
        else if(n_systems==10)A[i]=parseInt(A[i],2);
        
        
    }
    return A.join('.');
}
//console.log(broadCastIP("192.168.1.1",20,16));

function delTable(tableId){
    document.getElementById("table").innerHTML="";
}


function maketable(data,tableId){
    var rows=[];
    var table=document.createElement("table");
    for(i=0;i<data.length;i++){
        rows.push(table.insertRow(-1));
        for(j=0;j<data[0].length;j++){
            cell=rows[i].insertCell(-1);
            cell.appendChild(document.createTextNode(data[i][j]));
        }
    }
    document.getElementById(tableId).appendChild(table);
}
//リセット
function reset(){
    document.querySelector('input[name="IP"]').value="";
    document.querySelector('input[name="NetIP"]').value="";
    document.getElementById("subLength").value="1";
    document.getElementsByName("systems")[1].checked=true;
    delTable("table");
}
//クラスを判断
function judgeClass(strIP){
    num=strIP.split('.')[0];
    if(num>=0&&num<128)return "A";
    else if(num>=128&&num<192) return "B";
    else if(num>=192&&num<=224)return "C";
    else return "Error";
}
function numHost(strIP,n){
    var a=hostIP_start(strIP,n,2);
    var b=broadCastIP(strIP,n,2);
    var x="";
    var y="";
    a=a.split('.');
    b=b.split('.');
    for(i=0;i<a.length;i++){
        x+=a[i];
        y+=b[i];
    }
    
    y=parseInt(y,2);
    x=parseInt(x,2);
    return y-x;
}
function numIP(strIP,n){
    return numHost(strIP,n)+2;
}


