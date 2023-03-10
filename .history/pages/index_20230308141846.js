import { useState, useEffect,useRef} from 'react'
import styles from '../styles/HomePage.module.css'
import Link from 'next/link'
import { ethers } from 'ethers'
import { client, challenge, authenticate,defaultProfile,publications,collections} from '../api'
export default function Home({data}) {
  const[allBrochures,setAllBrochures] = useState([])
  const [token, setToken] = useState()
  const [address, setAddress] = useState()
  const [myProfile,setMyProfile] = useState()
  const [clickIndexFlag,setClickIndexFlag]=useState([true,false,false])
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
    let tempAllbrochures =[]
    data.data.map((user)=>{
      // console.log(user)
      let dataParse =JSON.parse(user.data)
      let brochures = dataParse.brochures
      tempAllbrochures=tempAllbrochures.concat(brochures)
      // console.log(brochures)
    })
    console.log(tempAllbrochures)
    setAllBrochures(tempAllbrochures)
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
  if (!data) return null
  return(
  <div className={styles.container}>
    <div className={styles.header}>
      <div className={styles.logo_LensView}>Lensview</div>
      <div className={styles.options}>
        {clickIndexFlag[0] && <div style={{width:"48.25%",color:'rgba(0, 0, 0, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Recommendation</div>} 
        {clickIndexFlag[1] && <div style={{width:'28.5%' ,color:'rgba(0, 0, 0, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Interests</div>}        
        {clickIndexFlag[2] &&<div style={{width:'23.25%',color:'rgba(0, 0, 0, 1)'}}>Create</div>}
        {!clickIndexFlag[0] && <div style={{width:"48.25%",color:'rgba(190, 190, 190, 1)',borderRight:'1px solid rgba(187,187,187,0.5)'}}>Recommendation</div>} 
        {!clickIndexFlag[1] && <div style={{width:'28.5%' ,color:'rgba(190, 190, 190, 1)', borderRight:'1px solid rgba(187,187,187,0.5)'}}>Interests</div>}        
        {!clickIndexFlag[2] &&<div style={{width:'23.25%',color:'rgba(190, 190, 190, 1)'}}>Create</div>}
      </div>
      <div></div>
      <div className={styles.search}>
        <div className={styles.searchIcon}></div>
        <input style={{border:'none',backgroundColor:'rgba(245, 245, 245, 1)',height:'32px',outline:'none',width:'80%'}}></input>
      </div>
      {/* <Link className={styles.myHome} target="_blank" style={{width:'6.1rem',height:'6.1rem',position:'absolute'}} href={``}>
      
      </Link> */}
      <div className={styles.myHome}>
      { /* if the user has not yet connected their wallet, show a connect button */ }
      {
        !address && <div onClick={connect} className={styles.h_login}>Connect</div>
      }
      { /* if the user has connected their wallet but has not yet authenticated, show them a login button */ }
      {
        address && !token && <div onClick={login} className={styles.h_login}>Login</div>
      }
      { /* once the user has authenticated, show them a success message */ }
      {
        address && token && myProfile && <div className={styles.myProfile}>
        <div className={styles.reminder}></div> 
        <div className={styles.h_avatarUrl}>
          <img src={ myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div> 
        <div className={styles.downArrow}></div>
        </div>
      }

        {/* <Link style={{display:'block',width:'100%',color:'white',fontSize:'0.6rem',lineHeight:'41px'}}  target="_blank"  href={`/home`}> I have a lens handle </Link> */}
        {/* <div className={styles.remind}></div>
        {
        address && token && headerProps.myProfile && <div className={styles.h_avatarUrl}>
          <img src={ headerProps.myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div>
        }
        <div className={styles.myHomeBtn}></div> */}
      </div>
    </div>
    <div className={styles.body1}>
      <div className={styles.body1Control}></div>
    </div>
    <div className={styles.body2}>
    {
      allBrochures.map((brochureItem,brochureIndex) =>{
        return <div key={brochureIndex} className={styles.brochureItem}>
                <div className={styles.brochureBg}>
                  <img className={styles.brochureImg} src={brochureItem.brochure[0].src}></img>
                  <Link target="_blank" style={{width:'6.1rem',height:'6.1rem',position:'absolute'}} href={`/atlas/${brochureItem.id}`}></Link>
                </div>
                <div className={styles.brochureArea}>
                  <div>
                  {brochureItem.brochureName}
                  </div>
                  <div className={styles.brochureContral}>
                    <div onClick={(e) =>{}}  className={styles.brochureContralView}></div>                      
                    {/* <div onClick={(e) =>{brochureDelete(e,brochureItem,brochureIndex)}}  className={styles.brochureContralDel}></div>
                    <div onClick={(e) =>{brochureEdit(e,brochureItem,brochureIndex)}}  className={styles.brochureContralEdit}></div> */}
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