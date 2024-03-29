import { useState, useEffect,useRef} from 'react'
import styles from '../styles/HomePage.module.css'
import Link from 'next/link'
import { ethers } from 'ethers'
import Head from 'next/head'
import { client, challenge, authenticate,defaultProfile,publications,collections} from '../api'
export default function Home({data}) {
  const[allAtlas,setAllAtlas] = useState([])
  const[allPlayList,setAllPlayList] =useState([])
  const[allVideoList,setAllVideoList] =useState([])
  const [token, setToken] = useState()
  const [address, setAddress] = useState()
  const [myProfile,setMyProfile] = useState()
  const [clickIndexFlag,setClickIndexFlag]=useState([true,false,false])
  const [clickMoreFlag,setClickMoreFlag] = useState(true)
  const [clickMoreListFlag,setClickMoreListFlag]=useState([true,false,false,false])
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
    }
    checkConnection()
    fetchAllBrochures()
  }, [data])
  async function fetchAllBrochures(){
    let tempAllAltas =[]
    let tempAllPlayList=[]
    let tempAllVideoList=[]
    data.data.map((user)=>{
      // console.log(user)
      let dataParse =JSON.parse(user.data)
      let brochures = dataParse.brochures
      let songLists =dataParse.songLists
      let videoLists =dataParse.videoLists
      tempAllAltas=tempAllAltas.concat(brochures)
      if(songLists){
        tempAllPlayList = tempAllPlayList.concat(songLists)
      }
      if(videoLists){
        tempAllVideoList= tempAllVideoList.concat(videoLists)
      }
      // console.log(brochures)
    })
    console.log(tempAllAltas)
    console.log(tempAllPlayList)
    console.log(tempAllVideoList)
    setAllAtlas(tempAllAltas)
    setAllPlayList(tempAllPlayList)
    setAllVideoList(tempAllVideoList)
  }
  /******链接和登录的相关代码 */
  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.listAccounts()
    if (accounts.length) {
      setAddress(accounts[0])
      // console.log(accounts)
    }
  }
  async function connect() {
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send('eth_requestAccounts')
    if (account.result.length) {
      setAddress(account.result[0])
      // console.log(address)
    }
  }
  async function login() {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address }
      })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(challengeInfo.data.challenge.text)
      /* authenticate the user */
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address, signature
        }
      })
      /* if user authentication is successful, you will receive an accessToken and refreshToken */
      const { data: { authenticate: { accessToken }}} = authData
  
      // console.log({ accessToken })
      setToken(accessToken)
      /*********************************获取个人在LENS上的信息开*********************** */
      fetchProfile()
      /*********************************获取个人在LENS上的信息关*********************** */
    } catch (err) {
      console.log('Error signing in: ', err)
    }
  }
  async function fetchProfile(){
    try {
      const defaultProfileInfo = await client.query({
        query:defaultProfile,
        variables: { address }
      })
      // console.log(defaultProfileInfo)
      /*********************对象拷贝开 *************************************************************/
      let mydefalutProfile ={ ...defaultProfileInfo.data.defaultProfile}
      /*********************对象拷贝关 *************************************************************/
      /*****************************************对象解构赋值开************************************* */
      // const {data : {defaultProfile: { handle }}} = defaultProfileInfo
      /*****************************************对象解构赋值关************************************* */

      let picture = mydefalutProfile.picture
      if (picture && picture.original && picture.original.url) {
        if (picture.original.url.startsWith('ipfs://')) {
          let result = picture.original.url.substring(7, picture.original.url.length)
          mydefalutProfile.avatarUrl = `http://lens.infura-ipfs.io/ipfs/${result}`
        } else {
          mydefalutProfile.avatarUrl = picture.original.url
        }
      }
      console.log(mydefalutProfile)
      // console.log(picture)
      setMyProfile(mydefalutProfile)
    } catch (err) {
      console.log({ err })
    }
  }
  async function fetchAtlas(){
    setClickMoreListFlag([true,false,false,false])
  }
  async function fetchPlayList(){
    setClickMoreListFlag([false,false,true,false])

  }
  async function fetchAlbum(){
    setClickMoreListFlag([false,true,false,false])
  }
  function switchMore(){
    var tempBoolean
    if(clickMoreFlag){
      tempBoolean=false
    }else{
      tempBoolean=true
    }
    setClickMoreFlag(tempBoolean)
  }
  if (!data) return null
  return(

  <div className={styles.container}>
    <Head>
      <title>Lensview</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content="这是一个基于Lens协议,基于媒体分享的web3社交网站" />
      <link rel="icon" href="/webIcon.ico" />
  {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" /> */}
    </Head>
    <div className={styles.header}>
      <div className={styles.logo_LensView}>Lensview</div>
      <div className={styles.options}>
        {<div className={clickIndexFlag[0] ? styles.recommendationActive : styles.recommendation} style={{}}>Recommendation</div>} 
        {<div className={clickIndexFlag[1] ? styles.interestsActive : styles.interests}  style={{}}>Interests</div>}        
        {<div className={clickIndexFlag[2] ? styles.createActive : styles.create}  style={{}}>Create
        <div className={styles.downArrow1}></div>
        </div>}
      </div>
      <div></div>

      <div className={styles.myHome}>
      <Link  className={styles.h_login} target='_blank'>Contact</Link>
      { /* if the user has not yet connected their wallet, show a connect button */ }
      {/* {
        !address && <div onClick={connect} className={styles.h_login}>Connect</div>
      } */}
      { /* if the user has connected their wallet but has not yet authenticated, show them a login button */ }
      {/* {
        address && !token && <div onClick={login} className={styles.h_login}>Login</div>
      } */}
      { /* once the user has authenticated, show them a success message */ }
      {/* {
        address && token && myProfile && <div className={styles.myProfile}>
        <div className={styles.reminder}></div> 
        <div className={styles.h_avatarUrl}>
          <img src={ myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div> 
        <div className={styles.downArrow}></div>
        </div>
      } */}
      </div>
    </div>
    {<div className={styles.moreUnClick} onClick={switchMore}><span>More</span></div>}
    {
      <div className={ clickMoreFlag? styles.moreList : styles.moreListHidden}>
        {/* <div className={styles.more} onClick={switchMore}><span>More</span></div> */}
        <div className={styles.atlas} onClick={fetchAtlas}>
          <div className={clickMoreListFlag[0] ? styles.atlasLogoActive : styles.atlasLogo}><img></img></div>
          <span style={clickMoreListFlag[0] ? {color:'rgba(0,0,0,1)',fontSize:'12px',fontWeight:'bold'}:{color:'rgba(52,52,52,1)',fontSize:'12px',fontFamily:'PingFangSC-regular'}}>Atlas</span>
        </div>
        <div className={styles.album} onClick={fetchAlbum}>
        <div className={clickMoreListFlag[1] ? styles.albumLogoActive : styles.albumLogo}><img></img></div>
        <span style={clickMoreListFlag[1] ? {color:'rgba(0,0,0,1)',fontSize:'12px',fontWeight:'bold'}:{color:'rgba(52,52,52,1)',fontSize:'12px',fontFamily:'PingFangSC-regular'}}>Album</span>
        </div>
        <div className={styles.playlist} onClick={fetchPlayList}>
        <div className={clickMoreListFlag[2] ? styles.playlistLogoActive : styles.playlistLogo}><img></img></div>
        <span style={clickMoreListFlag[2] ? {color:'rgba(0,0,0,1)',fontSize:'12px',fontWeight:'bold'}:{color:'rgba(52,52,52,1)',fontSize:'12px',fontFamily:'PingFangSC-regular'}}>PlayList</span>
        </div>
        <div className={styles.show}>
        <div className={clickMoreListFlag[3] ? styles.showLogoActive : styles.showLogo}><img></img></div>
        <span style={clickMoreListFlag[3] ? {color:'rgba(0,0,0,1)',fontSize:'12px',fontWeight:'bold'}:{color:'rgba(52,52,52,1)',fontSize:'12px',fontFamily:'PingFangSC-regular'}}>Show</span>
        </div>
    </div>
    }
    <div className={styles.body1}>
      <div className={styles.body1Control}></div>
    </div>
    <div className={styles.body2}>
    {
    clickMoreListFlag[0] &&  allAtlas.map((brochureItem,brochureIndex) =>{
        return <div key={brochureIndex} className={styles.brochureItem}>
                <div className={styles.brochureBg}>
                  <img className={styles.brochureImg} src={brochureItem.brochure[0].src}></img>
                  <Link target="_blank" style={{width:'50%',height:'50%',position:'absolute'}} href={`/atlas/${brochureItem.id}`}></Link>
                </div>
                <div className={styles.brochureArea}>
                  <div style={{width:'7.5rem',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  {brochureItem.brochureName}
                  </div>
                  <div className={styles.brochureContral}>
                    <div onClick={(e) =>{}}  className={styles.brochureContralView}></div>                      
                    <div className={styles.brochureMediaShare}></div>
                  </div>
                </div>
        </div>
      })
    }
    {
    clickMoreListFlag[2] &&  allPlayList.map((brochureItem,brochureIndex) =>{
        return <div key={brochureIndex} className={styles.brochureItem}>
                <div className={styles.playlistBg}>
                  <img className={styles.brochureMusic} src={brochureItem.brochure[0].cover}></img>
                  <div className={styles.playlistBone}></div>
                  <Link target="_blank" style={{width:'50%',height:'50%',position:'absolute'}} href={`/playlist/${brochureItem.id}`}></Link>
                </div>
                <div className={styles.brochureArea}>
                  <div style={{width:'7.5rem',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  {brochureItem.brochureName}
                  </div>
                  <div className={styles.brochureContral}>
                    <div onClick={(e) =>{}}  className={styles.brochureContralView}></div>                      
                    <div className={styles.brochureMediaShare}></div>
                  </div>
                </div>
        </div>
      })
    }
    {
    clickMoreListFlag[1] &&  allVideoList.map((brochureItem,brochureIndex) =>{
        return <div key={brochureIndex} className={styles.brochureItem}>
                <div className={styles.movielistBg}>
                  <img className={styles.brochureMovie} src={brochureItem.brochure[0].cover || ' '}></img>
                  <Link target="_blank" style={{width:'6.6rem',height:'3.3rem',position:'absolute',top:'3.15rem',left:'2.6rem'}} href={`/videolist/${brochureItem.id}`}></Link>
                </div>
                <div className={styles.brochureArea}>
                <div style={{width:'7.5rem',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                  {brochureItem.brochureName}
                  </div>
                  <div className={styles.brochureContral}>
                    <div onClick={(e) =>{}}  className={styles.brochureContralView}></div>                      
                    <div className={styles.brochureMediaShare}></div>
                  </div>
                </div>
        </div>
      })
    }  
    </div>
  </div>
  )
}
export async function getServerSideProps(context){
  const id  = 'welcome to home'
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'allUsers',
    }),
  });
  const data = await res.json() 
  return{
    props:{
      data:data,
    }
  }
}