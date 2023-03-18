import styles from '../../styles/Atlas.module.css'
import { useState, useEffect,useRef} from 'react'
import Link from 'next/link'
import Head from 'next/head'
export default function Brochure({data,id}) {
  console.log(data)
  console.log(id)
  const [loadingFlag,setLoadingFlag] = useState(false)
  const [myProfile,setMyProfile] =useState({})
  const [brochure,setBrochure] =useState({brochure:[],brochureTag:[],brochureName:null,category:'',likes:0,bgImg:'',content:'',slots:{},id:''})
  // const [imgLargeSiz,setImgLargeSize] =useState('')
  // const [imgLargeFlag,setImgLargeFlag] =useState(false)
  const [currentMusic,setCurrentMusic] =useState({})


  /***第一步配置rem */
  useEffect(() => {
    if (data) {
      var fz = window.innerWidth / (1440/28)
      if(fz<16){
        fz=16
      }
      if(fz>28){
        fz=28
      }
      document.documentElement.style.fontSize = fz+'px'
      fetchBrochure()
    }
  }, [data])
  //这边的册子都是歌单的意思，名称我就不再更改了
  /*****第二步将服务器返回的data装填歌单和用户 */
  function fetchBrochure(){
    try {
      let tempArr = id.split('T')
      console.log(tempArr)
      let tempobj ={}
      tempobj.name =data.data[0].name
      tempobj.avatarUrl= data.data[0].avatarUrl
      setMyProfile(tempobj)
      let getdata = JSON.parse(data.data[0].data) ||[]
      let brochures =getdata.songLists
      console.log(brochures)
      let tempbrochure = null
      for(let i=0; i<brochures.length; i++){
        if(brochures[i].id == id){
          tempbrochure = brochures[i]
          console.log(tempbrochure)
          break
        }
      }
      if(tempbrochure){
        console.log('找到了册子')
        setBrochure(tempbrochure) 
        console.log(tempbrochure)
      }else{
        console.log('未找到该册子，可能已被删除')
      }
    } catch (error) {
      console.log('error fetching brochure...', error)
    }
  }
  function startPlay(obj){
    console.log(obj)
  }
  if (!data) return null
  return(
    <div className={styles.cotainer}>
      <Head>
      <title>Lensview</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content="这是一个基于Lens协议,基于媒体分享的web3社交网站" />
      <link rel="icon" href="/webIcon.ico" />
      {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" /> */}
      </Head>
      <div className={styles.header}>
        <div className={styles.h_blank1}></div>
        <div className={styles.return}>
          <Link style={{width:'100%',height:'100%',display:'block'}} href={`/`}></Link>
        </div>
        <div className={styles.h_menu}>
          <div className={styles.div_atlas}>
            <div className={styles.info_atlas}>PlayList</div>
          </div>
          <div style={{width:'1px',height:'16px',background:'rgba(187, 187, 187, 1)',marginLeft:'0.6rem',marginRight:'0.6rem'}}></div>
          <div className={styles.div_brochureName}>
            <div className={styles.info_brochureName}>{brochure.brochureName}</div>
          </div>
        </div>
      </div>
      <div className={styles.body1Music}>
        <div className={styles.body1Contanier}>
          <div className={styles.body1Info}>
            <div className={styles.musicFrame}>
              {brochure.brochure[0]&&<img  src={brochure.brochure[0].cover}></img>}
            </div>
            <div className={styles.brochureInfo}>
              <div style={{width:'100%',height:'1.9286rem',lineHeight:'1.9286rem',color:'rgba(255,255,255,1)',fontFamily:'PingFangSC-regular',fontSize:'1.286rem'}}>{brochure.brochureName}</div>
              <div className={styles.authorProfile} style={{width:'100%',height:'1.786rem',}}><img style={{width:'1.7rem',height:'1.7rem',overflow:'hidden',borderRadius:'0.85rem',border:'1px solid #f1f1f1'}} src={myProfile.avatarUrl} alt={'当前网络不可用'} /><span>{myProfile.name}</span>
                <div className={styles.goToMyProfile}>
                  <a target="_blank" href={'https://lenster.xyz/u/'+myProfile.name}></a>
                </div>
              </div>
              <div style={{width:'100%',height:'3.2143rem',fontSize:'0.8571rem',textAlign:'left',fontFamily:' PingFangSC-regular',fontSize:'0.643rem',color:'rgb(255,255,255)'}}>{brochure.brochureTag[0]|| ''}<br></br>{brochure.brochureTag[1] || ''}<br></br>{brochure.brochureTag[2] || ''}</div>
            </div>
          </div>
          <div className={styles.body1Contral}>
            <div className={styles.body1Media}>
              <div className={styles.likes}></div>
              <div className={styles.share}></div>
            </div>
          </div>
          </div>
        </div>
      <div className={styles.body2}>
        <div className={styles.musicStage}>
          {
            brochure &&  brochure.brochure.map((brochurePictureItem,brochurePictureIndex)=>{
              return <div key={brochurePictureIndex}   className={styles.musicContanier}>
                <img onClick={(e)=>{
                  // setImgLargeSize(brochurePictureItem.src)
                  // setImgLargeFlag(true)
                }} src={brochurePictureItem.cover}></img>
                <div className={styles.startPlay} onClick={(e)=>{
                  startPlay(brochurePictureItem)
                  // setImgLargeSize(brochurePictureItem.src)
                  // setImgLargeFlag(true)
                }}></div>
                <div className={styles.goToLensBg}>
                </div>
                <div className={styles.goToLens}>
                  <a target="_blank" href={'https://lenster.xyz/posts/'+brochurePictureItem.id}></a>
                </div>
                <span>{brochurePictureItem.name} - {brochurePictureItem.author}</span>
              </div>
            })
          }
        </div>
      </div>
      <div className={styles.audioPlayer}>
        {brochure.brochure [0] && <img  src={ currentMusic.cover || brochure.brochure[0].cover} ></img>}
        <span>正在播放 : {currentMusic.name} - {currentMusic.author} </span>
        <audio src={currentMusic.src} controls></audio>

      </div>
    </div>
  ) 
}
export async function getServerSideProps(context){
  const{ id } =context.query
  // const request =require('../api/search'); 
  // console.log(request)
  let tempArr = id.split('T')
  // console.log(request)
  // console.log('gaga')
  let user =tempArr[0]
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: user,
    }),
  });
  const data = await res.json() 
  return{
    props:{
      data:data,
      id:id,
    }
  }
}