import React, { useEffect } from 'react'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import { client, challenge, authenticate,defaultProfile,publications,collections} from '../api'
import Image from 'next/image'
import { id } from 'ethers/lib/utils'
// import { DefaultProfileDocument, DefaultProfileRequest } from '../graphql/generated';
function Header({headerProps}){
  // console.log(challenge)
  // console.log(headerProps)
  function switchBodyACollection(){
    // console.log(setbodyACollectionFlag)
    headerProps.setbodyACollectionFlag(true)
    headerProps.setbodyAExhibitionFlag(false)
  }
  function switchBodyAExhibition(){
    headerProps.setbodyACollectionFlag(false)
    headerProps.setbodyAExhibitionFlag(true)
    headerProps.setaddCollectionComponentFlag(false)
  }
  // console.log(flag)
  /********************************************************身份验证登录开************************************************/
  const [address, setAddress] = React.useState()
  const [token, setToken] = React.useState()
  React.useEffect(()=>{
    console.log('UE1')
  /* when the app loads, check to see if the user has already connected their wallet */
    checkConnection()
  },[])
  /*********************************获取个人在LENS上的信息开*********************** */
  async function fetchProfile(){
    try {
      const defaultProfileInfo = await client.query({
        query:defaultProfile,
        variables: { address }
      })
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
      headerProps.setMyProfile(mydefalutProfile)
      /************获取个人在我们服务器上的信息 开 *******************************/
      let user =mydefalutProfile.name
      if(window.localStorage.getItem(user)){
        console.log('找到了用户')
      }else{
        let value =JSON.stringify({imgAllBeUsed:['http://lens.infura-ipfs.io/ipfs/bafybeig56zmnrzvl6y7kbmfg37uyzporjt7tx6d3twoboh5jkhuuhslasa', 'http://lens.infura-ipfs.io/ipfs/bafybeifxflkdiyk55gd56st3gs23v2lah32badiloxm6vislesnnnsmgjy', 'http://lens.infura-ipfs.io/ipfs/bafkreifgvw44h4n27p3vnliuvxkejxwuzhyz77k7ilesn6nsxz7b33qode']
        ,brochure:[]})
        window.localStorage.setItem(user,value)
        console.log('已新建用户')
      }
      /************获取个人在我们服务器上的信息 关 *******************************/
    } catch (err) {
      console.log({ err })
    }
  }
  /*********************************获取个人在LENS上的信息关*********************** */
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
      console.log(address)
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
  
      console.log({ accessToken })
      setToken(accessToken)
      /*********************************获取个人在LENS上的信息开*********************** */
      fetchProfile()
      /*********************************获取个人在LENS上的信息关*********************** */
    } catch (err) {
      console.log('Error signing in: ', err)
    }
  }
  
  /********************************************************身份验证登录关***********************************************/  
   return(
    <div className={styles.header}>
      <div className={styles.h_blank1}></div>
      <div className={styles.h_menu}>
        <div className={styles.logo_Lenstime} >Lenstime</div>      
        <div className={styles.div_Collection}>
          <div onClick={switchBodyACollection}  className={headerProps.bodyACollectionFlag ? styles.btn_Collection : styles.btn_NotSelected_color}>Collection</div>
        </div>
        <div className={styles.div_Exhibition}>
          <div onClick={switchBodyAExhibition}  className={headerProps.bodyAExhibitionFlag ? styles.btn_Exhibition : styles.btn_NotSelected_color}>Exhibition</div>
        </div>
      </div>
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
        address && token && headerProps.myProfile && <div className={styles.h_avatarUrl}>
          <img src={ headerProps.myProfile.avatarUrl} alt={'当前网络不可用'} />
        </div>
      }
      <div className={styles.h_blank2}></div>
    </div>
  )
}
function BodyACollection({bodyACollectionProps}){
  useEffect(() =>{},[])
  // console.log(3)
  function creatBrochure(){
    console.log('creatBrochure')
    bodyACollectionProps.setaddCollectionComponentFlag(true)
  }
  return(
  <div className={styles.bodyACollection}>
      <div className={styles.collectionSlogan}>Use Lenstime now to create your own brochure</div>
      <div className={styles.collectionDomain}>
        <div onClick={creatBrochure} className={styles.collectionAdd}>Create  Brochure</div>
      </div>  
  </div>
  )
}
function BodyAExhibition({bodyAExhibitionFlag}){
  // console.log(4)
    return(
      <div className={styles.bodyAExhibition}>
        <div className={styles.collectionSlogan}>Use Lenstime now to create your solo exhibition</div>
        <div className={styles.collectionDomain}>
          <div className={styles.collectionAdd}>Create  Exhibition</div>
        </div>   
      </div>
    )
}
function BodyBCollectionBlank(){
  // console.log(5)
    return(
      <div className={styles.bodyBCollectionBlank}>
        <div className={styles.collectionBlankBg}></div>
        <div className={styles.collectionBlankFont}>Your personal collection has not been classified yet</div>
      </div>
      )
}
function AddCollectionComponent({addCollectionComponentProps}){
  const noImage="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' viewBox='0 0 700 475'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage preserveAspectRatio='none' filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' href='data:image/svg+xml;base64,CiAgPHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KICAgIDxkZWZzPgogICAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iMjAlIiAvPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMyMjIiIG9mZnNldD0iNTAlIiAvPgogICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzMzMiIG9mZnNldD0iNzAlIiAvPgogICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiMzMzMiIC8+CiAgICA8cmVjdCBpZD0iciIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9InVybCgjZykiIC8+CiAgICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTcwMCIgdG89IjcwMCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiICAvPgogIDwvc3ZnPg=='/%3E%3C/svg%3E"
  const [brochure,setBrochure] =React.useState([])
  const reloadCount =React.useRef(0)
  // const brochure =[]
  // const brochure =React.useRef([])
  console.log(brochure)
  /*********用来收集创建册子的表单数据 ******************************/
  const dataCreateBrochure =React.useRef({brochureName:'',brochureTag:[],brochure:[]})

  /********pageIndex和pageIndex2 分别用来存储俩个背包在对应页数下的的NFT展示 都是从第0页开始 */
  var [pageIndex,setPageIndex] =React.useState(0)
  var [pageIndex2,setPageIndex2] =React.useState(0)
  var [knapsackSelection,setKnapsackSelection] =React.useState(1)

  /****当图片不足以绘制的时候，需要一定的时间来重新填充LENS的帖子，然后填充背包，所以希望此时用户不要点击翻页 */
  const [pageFlag,setPageFlag] =React.useState(true)
  const [pageFlag2,setPageFlag2] =React.useState(true)
  // const index =React.useRef(0)
  // console.log(index)
  // console.log(indexRef)
  /**************切换背包时候的状态变化 */
  const [postFlag,setPostFlag] =React.useState(true)
  const [collectionFlag,setCollectionFlag] =React.useState(false)
  function cancelPrompt(){
    console.log('cancel')
  }
  function cancelCreatBrochure(e){
    e.stopPropagation() //阻止冒泡事件
    console.log('cancelCreatBrochure')
    addCollectionComponentProps.setaddCollectionComponentFlag(false)
    addCollectionComponentProps.setKnapsackPictures([])
  }
  useEffect(() =>{
    console.log('你已经打开了背包界面')
    fetchPublications(0)
    //第一步首先装填出版物并生成所含所有图片的数组，并保存至dataRef.current.pictures
    fetchCollections(0)
    //第一步首先装填收藏品并生成所含所有图片的数组，并保存至dataRefCollections.current.pictures
  },[addCollectionComponentProps.addCollectionComponentFlag])
  /********************************装填出版物，获取个人在LENS服务器上的帖子，并生成数组****************************************/
  //这里的index用来表示，是重置出版物，还是获取下一个出版物，index 值为0或者1,0表示重置，重新装填一遍。1表示获取下次出版物并装填
  async function fetchPublications(index){
    if(addCollectionComponentProps.myProfile){
      try {
        const profileId= addCollectionComponentProps.myProfile.id
        const userPublications = await client.query({
          query:publications,
          variables:{id:profileId,limit:12,publicationTypes:['POST','MIRROR'],cursor:addCollectionComponentProps.dataRef.current.cursor[index]}
        })
        let myPublications ={ ...userPublications.data.publications}
        console.log(myPublications)

        addCollectionComponentProps.dataRef.current.cursor = [myPublications.pageInfo.prev,myPublications.pageInfo.next]
        console.log(addCollectionComponentProps.dataRef)
        /*****通过Promise.all 和map函数 重新得到一个简化过滤后的 帖子数组 publicationsData，将LENS服务器上不可读的图片地址转换成https图片地址 开************/
        let publicationsData = await Promise.all(myPublications.items.map(async publicationInfo => {
          let publish = {}
          publish.id=publicationInfo.id
          let pictures =publicationInfo.metadata.media
          // console.log(pictures)
          publish.imgUrl=[]
          for(let i=0;i<pictures.length;i++){
            if (pictures[i] && pictures[i].original && pictures[i].original.url) {
              if (pictures[i].original.url.startsWith('ipfs://')) {
                let result = pictures[i].original.url.substring(7, pictures[i].original.url.length)
                publish.imgUrl.push(`http://lens.infura-ipfs.io/ipfs/${result}`)
              } else {
                publish.imgUrl.push(pictures[i].original.url) 
              }
            }
          }
          return publish
        }))
        /*****通过Promise.all 和map函数 重新得到一个简化过滤后的 帖子数组 publicationsData 将LENS服务器上不可读的图片地址转换成https图片地址 关*************/
        /*****通过map函数 得到一个 非帖子 纯图片数组publicationsPictures 开*************/
        let publicationsPictures=[]
        publicationsData.map(post =>{
          for(let i=0;i<post.imgUrl.length;i++){
            let temObj={}
            temObj.src=post.imgUrl[i]
            temObj.id =post.id
            temObj.state=[0,0,0]//一开始默认设计三个状态，第一个状态用于判断图片是否被选中
            publicationsPictures.push(temObj)
          }
        })
        console.log(publicationsPictures)
         /*****通过map函数 得到一个 非帖子 纯图片数组publicationsPictures 关*************/
         /*******如果index == 1  fetchPublications(1)那么出版物数组将被连更，否则用fetchPublications(0)，出版物将被重置*/       
        if(index == 1){
          let temparr=addCollectionComponentProps.dataRef.current.pictures.concat(publicationsPictures)
          addCollectionComponentProps.dataRef.current.pictures=temparr
        }else{
          addCollectionComponentProps.dataRef.current.pictures=publicationsPictures
        }
        //第二步装填第一种类型背包1，出版物相关图片：
        fetchKnapsack(1) 

        //需要1 查重，检查第一步得到的图片中，有没有已经添加至我们服务器图册中的，如果有，将不显示在背包里。
        //需要2 判断查重后的图片数量，是否还能满足12张，用于渲染到网页中，如不满足，则再次装填出版物，并走到这一步
      } catch (err) {
        console.log({ err })
      }
    }else{
      console.log('请先登录')
    }
  }
  /****************获取个人在LENS服务器上的所有收藏品，并生成图片数组 *******************************/
  async function fetchCollections(index){
    if(addCollectionComponentProps.myProfile){
      try {
        const address= addCollectionComponentProps.myProfile.ownedBy
        console.log(address)
        const userCollections = await client.query({
          query:collections,
          variables:{address:address,limit:12,publicationTypes:['POST'],cursor:addCollectionComponentProps.dataRefCollections.current.cursor[index]}
        })
        let myCollections ={ ...userCollections.data.publications}
        console.log(myCollections)

        addCollectionComponentProps.dataRefCollections.current.cursor = [myCollections.pageInfo.prev,myCollections.pageInfo.next]
        console.log(myCollections.pageInfo.next)
        let collectionsData = await Promise.all(myCollections.items.map(async collectionInfo => {
          let collection = {}
          collection.id=collectionInfo.id
          let pictures =collectionInfo.metadata.media
          collection.imgUrl=[]
          for(let i=0;i<pictures.length;i++){
            if (pictures[i] && pictures[i].original && pictures[i].original.url) {
              if (pictures[i].original.url.startsWith('ipfs://')) {
                let result = pictures[i].original.url.substring(7, pictures[i].original.url.length)
                collection.imgUrl.push(`http://lens.infura-ipfs.io/ipfs/${result}`)
              } else {
                collection.imgUrl.push(pictures[i].original.url) 
              }
            }
          }
          return collection
        }))
        let collectionsPictures=[]
        collectionsData.map(post =>{
          for(let i=0;i<post.imgUrl.length;i++){
            let temObj={}
            temObj.src=post.imgUrl[i]
            temObj.id =post.id
            temObj.state=[0,0,0]//一开始默认设计三个状态，第一个状态用于判断图片是否被选中
            collectionsPictures.push(temObj)
          }
        })
        console.log(collectionsPictures)   
        if(index == 1){
          let temparr=addCollectionComponentProps.dataRefCollections.current.pictures.concat(collectionsPictures)
          addCollectionComponentProps.dataRefCollections.current.pictures=temparr
        }else{
          addCollectionComponentProps.dataRefCollections.current.pictures=collectionsPictures
        }
        fetchKnapsack(2)   //填充背包类型2，所有收藏品的背包
      } catch (err) {
        console.log({ err })
      }
    }else{
      console.log('请先登录')
    }
  }
  /******************装填背包，获取个人在我们服务器上建立相册已用过的图片，然后查重，最后绘制背包图片 */
  function fetchKnapsack(knapsackIndex){
      console.log('正在装填背包图片')
      let pictures
      if(knapsackIndex == 1){
        pictures=addCollectionComponentProps.dataRef.current.pictures
      }else{
        pictures=addCollectionComponentProps.dataRefCollections.current.pictures
      }
      // console.log(pictures[0].src)
      if(window.localStorage.getItem(addCollectionComponentProps.myProfile.name)){
        let data=JSON.parse(window.localStorage.getItem(addCollectionComponentProps.myProfile.name))
        console.log(data)
        let imgAllBeUseLength =data.imgAllBeUsed.length
          if(data.imgAllBeUsed.length>0 && pictures.length > 0 ){
            console.log('用户添加过图片/创建过图册')
              for(let i=0;i<pictures.length;i++){
                for(let j=0;j<imgAllBeUseLength;j++){
                    // console.log(pictures[i].src)
                    if(data.imgAllBeUsed[j] == pictures[i].src){
                      console.log('该图片已存在')
                      pictures.splice(i,1)
                      i--
                      break
                    }else{
                      console.log('该图片不存在')
                    }
                }
              }
              if(pictures.length>=12){
                  reloadCount.current =0
                console.log('图片数量满足绘制')
                if(knapsackIndex == 1 ){
                  drawKnapsack(1)
                  setPageFlag(true)
                }else{
                  drawKnapsack(2)
                  setPageFlag2(true)
                }
                console.log(pictures)
              }else{
                console.log('图片数量不满足绘制，需要重新装填出版物')
                if(reloadCount.current>5){
                  console.log('装填次数太多依旧不满足') 
                  return false
                }
                if(knapsackIndex == 1){
                  fetchPublications(1)
                  setPageFlag(false)
                  reloadCount.current ++
                }else{
                  fetchCollections(1)
                  setPageFlag2(false)
                  reloadCount.current ++
                }

              }
          }else{
            console.log('用户还未添加过图片到我们服务器')
            if(pictures.length>=12){
              reloadCount.current =0
              console.log('图片数量满足绘制')
              if(knapsackIndex == 1){
                drawKnapsack(1)
              }else{
                drawKnapsack(2) 
              }
              console.log(pictures)
            }else{
              console.log('图片数量不满足绘制，需要重新装填出版物')
              if(reloadCount.current>5){
                console.log('装填次数太多依旧不满足') 
                return false
              }
              if(knapsackIndex == 1){
                fetchPublications(1)
                reloadCount.current ++
              }else{
                fetchCollections(1)
                reloadCount.current ++
              }
            }
          }
      }else{
        console.log('请先登录/未找到该用户')
      }
    }

  function drawKnapsack(knapsackIndex){
    let pictures
    let temparr
    let temIndex
    if(knapsackIndex == 1){
      pictures=addCollectionComponentProps.dataRef.current.pictures
      temparr =[].concat(addCollectionComponentProps.knapsackPictures)
      temIndex =pageIndex
    }else{
      pictures=addCollectionComponentProps.dataRefCollections.current.pictures
      temparr =[].concat(addCollectionComponentProps.knapsackPictures2)
      temIndex =pageIndex2
    }
    // console.log(temparr[index.current])
    if(temparr[temIndex]){
      console.log('当前数组有内容')
      if(knapsackIndex == 1){
        setPageIndex(temIndex)
      }else{
        setPageIndex2(temIndex)
      }
 
    }else{
      console.log('当前数组无内容')
      if(pictures.length >=12 ){
        console.log(temparr.length)
        console.log(pictures)
        console.log('缓存数组图片大于12张,正在制作并绘制背包的12张图片')
        let groupA =pictures.splice(0,4)
        let groupB =pictures.splice(0,4)
        let groupC =pictures.splice(0,4)
        temparr[temIndex]=[groupA,groupB,groupC]
        console.log(temparr)
        if(knapsackIndex == 1){
          addCollectionComponentProps.setKnapsackPictures(temparr)
          setPageIndex(temIndex)
        }else{
          addCollectionComponentProps.setKnapsackPictures2(temparr)
          setPageIndex2(temIndex)
        }
      }else{
        console.log('图片不足以制作并绘制')
        // index--
        if(knapsackIndex == 1){
          fetchPublications(1)
          setPageFlag(false)
        }else{
          fetchCollections(1)
          setPageFlag2(false)
        }
      }

    }
  }
  function turnLeft(e){
    if(pageIndex <= 0){
      alert('当前已经是第一页')
    }else{
      e.stopPropagation() //阻止冒泡事件
      console.log('用户想看上一页')
      pageIndex--
      console.log(pageIndex)
      drawKnapsack(1)
    }
  }
  function turnLeft2(e){
    if(pageIndex2 <= 0){
      alert('当前已经是第一页')
    }else{
      e.stopPropagation() //阻止冒泡事件
      console.log('用户想看上一页')
      pageIndex2--
      console.log(pageIndex2)
      drawKnapsack(2)
    }
  }
  function turnRight(e){
    console.log('你正在使用post的翻页')
    e.stopPropagation() //阻止冒泡事件
    console.log('用户想看下一页')
    pageIndex++
    // pageIndex++
    console.log(pageIndex)
    drawKnapsack(1)
  }
  function turnRight2(e){
    console.log('你正在使用collection的翻页')
    e.stopPropagation() //阻止冒泡事件
    console.log('用户想看下一页')
    pageIndex2++
    // pageIndex++
    console.log(pageIndex2)
    drawKnapsack(2)
  }
  function ImgClick(e,groupIndex,itemIndex,pictureItem){
    // console.log(e)
    e.stopPropagation()
    console.log(groupIndex)
    console.log(itemIndex)
    console.log(pictureItem)
    let tempState =0
    if(pictureItem.state[0]==0){
      tempState=1
      let tempArr =[].concat(brochure)
      tempArr.push(pictureItem)
      setBrochure(tempArr)
      // brochure.push(pictureItem)
    }else{
      tempState=0
      let tempArr =[].concat(brochure)
      for(let i=0;i<brochure.length;i++){
        if(tempArr[i].src == pictureItem.src)
        {
          tempArr.splice(i,1)
          setBrochure(tempArr)
          break
        }
      }
    }
    console.log(brochure)
    let temObj =[].concat(addCollectionComponentProps.knapsackPictures)
    temObj[pageIndex][groupIndex][itemIndex].state[0]=tempState
    addCollectionComponentProps.setKnapsackPictures(temObj)
  }
  function ImgClick2(e,groupIndex,itemIndex,pictureItem){
    // console.log(e)
    e.stopPropagation()
    console.log(groupIndex)
    console.log(itemIndex)
    console.log(pictureItem)
    let tempState =0
    if(pictureItem.state[0]==0){
      tempState=1
      let tempArr =[].concat(brochure)
      tempArr.push(pictureItem)
      setBrochure(tempArr)
      // brochure.push(pictureItem)
    }else{
      tempState=0
      let tempArr =[].concat(brochure)
      for(let i=0;i<brochure.length;i++){
        if(tempArr[i].src == pictureItem.src)
        {
          tempArr.splice(i,1)
          setBrochure(tempArr)
          break
        }
      }
    }
    console.log(brochure)
    let temObj =[].concat(addCollectionComponentProps.knapsackPictures2)
    temObj[pageIndex2][groupIndex][itemIndex].state[0]=tempState
    addCollectionComponentProps.setKnapsackPictures2(temObj)
  }
  function ImgClick3(e,brochurePictureItem,brochureIndex){
    // console.log(e)
    e.stopPropagation()
    console.log(brochurePictureItem)
    console.log(brochureIndex)

    if(brochurePictureItem.state[0]==1){
      let tempArr =[].concat(brochure)
      tempArr[brochureIndex].state[0] =0
      tempArr.splice(brochureIndex,1)
      setBrochure(tempArr)
    }else{
      console.log('出错了,不应该有状态为0的图片')
    }
    console.log(brochure)
    // let temObj =[].concat(addCollectionComponentProps.knapsackPictures2)
    // temObj[pageIndex2][groupIndex][itemIndex].state[0]=tempState
    // addCollectionComponentProps.setKnapsackPictures2(temObj)
}
  function imgLoaded(e,groupIndex,itemIndex,pictureItem){
    // console.log('图片加载完毕')
    if(pictureItem.state[1]==1){
      console.log('图片已经被成功加载过一次')
    }else{
      console.log('正在将图片状态切换成已加载成功')
      let temObj =[].concat(addCollectionComponentProps.knapsackPictures)
      temObj[pageIndex][groupIndex][itemIndex].state[1]=1
      addCollectionComponentProps.setKnapsackPictures(temObj)
    }
  }
  function imgLoadedCollection(e,groupIndex,itemIndex,pictureItem){
    // console.log('图片加载完毕')
    // console.log(pictureItem)
    if(pictureItem.state[1]==1){
      console.log('图片已经被成功加载过一次')
    }else{
      let temObj =[].concat(addCollectionComponentProps.knapsackPictures2)
      temObj[pageIndex2][groupIndex][itemIndex].state[1]=1
      addCollectionComponentProps.setKnapsackPictures2(temObj)
    }
  }
  function switchPost(){
    setKnapsackSelection(1)
    setPostFlag(true)
    setCollectionFlag(false)
  }
  function switchCollected(){
    setKnapsackSelection(2)
    setPostFlag(false)
    setCollectionFlag(true)
  }
  function submitCreate(){
    console.log(dataCreateBrochure)
    dataCreateBrochure.current.brochure = [].concat(brochure)
    const regexStr =/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
    if(regexStr.test(dataCreateBrochure.current.brochureName)){
      console.log('册子名字没啥问题')
    }else{
      console.log('册子姓名只能是数字、字母和中文组成，不能包含特殊符号和空格。')
      return false
    }
    if(dataCreateBrochure.current.brochureTag.length>0){
      for(let i=0;i<dataCreateBrochure.current.brochureTag.length;i++){
        if(!regexStr.test(dataCreateBrochure.current.brochureTag[i])){
          console.log('标签只能是数字、字母和中文组成，不能包含特殊符号和空格。')
          return false
        }
      }
    }else{
      console.log('至少需要一个标签？')
    }
    if(dataCreateBrochure.current.brochure.length>0){
      console.log('我准备将你的册子写入数据库了')
      let user =addCollectionComponentProps.myProfile.name
      if(window.localStorage.getItem(user)){
        console.log('找到了用户')
        let data=JSON.parse(window.localStorage.getItem(user))
        // console.log(data)
        // data.brochure={...dataCreateBrochure.current}
        data.brochure.push(dataCreateBrochure.current)
        brochure.map(el=>{
          data.imgAllBeUsed.push(el.src)
        })
        let value=JSON.stringify(data)
        window.localStorage.setItem(user,value)
        /***********这里估计是一个异步操作，需要loading，然后关闭创建册子的组件，或者直接关闭 */
        addCollectionComponentProps.setaddCollectionComponentFlag(false)
        addCollectionComponentProps.setKnapsackPictures([])
        addCollectionComponentProps.setKnapsackPictures2([])
        addCollectionComponentProps.dataRef.current = {cursor:[null,null],pictures:[]}
        addCollectionComponentProps.dataRefCollections.current = {cursor:[null,null],pictures:[]}
        console.log(data)
      }else{
        console.log('没找到用户，并且没有在用户登录的时候，新建用户')
      }

    }else{
      console.log('图册未添加任何图片')
      return false
    }
  }
  return(
    <div onClick={cancelPrompt} className={styles.addCollectionContainer}>
      <div className={styles.addCollectionView}>
        <div className={styles.collectionView_part1}>
          <div className={styles.part1_name}>
            <p>NAME</p>
            <input onChange={(e)=>{dataCreateBrochure.current.brochureName= e.target.value}} placeholder='illustration'></input>
          </div>
          <div onClick={cancelCreatBrochure}  className={styles.part1_p2X}>🗙</div>
        </div>
        <div className={styles.collectionView_part2}>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[0]= e.target.value}}  placeholder='+ Add label'></input>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[1]= e.target.value}} placeholder='+ Add label'></input>
          <input onChange={(e)=>{dataCreateBrochure.current.brochureTag[2]= e.target.value}} placeholder='+ Add label'></input>
        </div>
        <div className={styles.collectionView_part3}>
          <div className={styles.part3CollectionView_imgContainer}>
 
            {
              brochure.map((brochurePictureItem,brochureIndex)=>{
                return <div key={brochureIndex} className={styles.part3CollectionView_imgItem}>
                <img  className={brochurePictureItem.state[0]==1 ? styles.imgSelectedBr6 :undefined} src={brochurePictureItem.src || noImage} ></img>
                {brochurePictureItem.state[0]==1 && <div onClick={(e) =>{ImgClick3(e,brochurePictureItem,brochureIndex)}} className={styles.imgESC}></div>}
                {/* {brochurePictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>} */}
                </div>
              })
            }   
          </div>
          {
            brochure.length>8 && <div className={styles.scrollInfo}>
            <div className={styles.chevron}></div>
            <div className={styles.chevron}></div>
            <div className={styles.chevron}></div>  
            </div>  
          }

        </div>
        <div className={styles.collectionView_part4}>
        <button onClick={submitCreate}  className={styles.part4_createBtn }>Create</button>
        </div>
      </div>
      <div className={styles.addCollectionKnapsack}>
        <div className={styles.knapsack_part1}>
          <div className={styles.part1_p1}>Knapsack</div>
          <div className={styles.part1_p2}>🗙</div>
        </div>
        <div className={styles.knapsack_part2}>Support batch selection</div>
        <div className={styles.knapsack_part3}>
          {/* <div onClick={turnLeft} className={styles.part3_turnleft}>←</div> */}
          <div className={styles.part3_imgContainer}>
            {
              knapsackSelection == 1 && addCollectionComponentProps.knapsackPictures[pageIndex]&& addCollectionComponentProps.knapsackPictures[pageIndex].map((knapsackPicturesGroup,groupIndex)  =>{
                return <div key={groupIndex} className={styles.imgGroup}>
                  {
                    knapsackPicturesGroup.map((pictureItem,itemIndex) =>{
                      return <div key={itemIndex} onClick={(e) =>{ImgClick(e,groupIndex,itemIndex,pictureItem)}} className={styles.part3_imgItem}>
                      <img onLoad={(e) =>{imgLoaded(e,groupIndex,itemIndex,pictureItem)}} className={pictureItem.state[0]==1 ? styles.imgSelectedBr3 :undefined}  src={pictureItem.state[1]==1? pictureItem.src : noImage} ></img>
                      {pictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>}
                      </div>
                    })
                  }
                </div>
              })
            }
            {
              knapsackSelection == 2 && addCollectionComponentProps.knapsackPictures2[pageIndex2]&& addCollectionComponentProps.knapsackPictures2[pageIndex2].map((knapsackPictures2Group,groupIndex)  =>{
                return <div key={groupIndex} className={styles.imgGroup}>
                  {
                    knapsackPictures2Group.map((pictureItem,itemIndex) =>{
                      return <div key={itemIndex} onClick={(e) =>{ImgClick2(e,groupIndex,itemIndex,pictureItem)}} className={styles.part3_imgItem}>
                      <img onLoad={(e) =>{imgLoadedCollection(e,groupIndex,itemIndex,pictureItem)}}  className={pictureItem.state[0]==1 ? styles.imgSelectedBr3:undefined}  src={pictureItem.state[1]==1? pictureItem.src : noImage} ></img>
                      {pictureItem.state[0]==1 && <div className={styles.imgSelected2}></div>}
                      </div>
                    })
                  }
                </div>
              })
            }     
          </div>
          {/* <div onClick={turnRight} className={styles.part3_turnright}>→</div> */}
        </div>
        <div className={styles.knapsack_part4}>
          {
            pageFlag && knapsackSelection == 1 && <div className={styles.part4_PageBtn}>
            <div onClick={turnLeft}  className={styles.part4_PageBtn_turnLeft}></div>
            <div className={styles.part4_PageBtn_PageInfo}></div>
            <div onClick={turnRight} className={styles.part4_PageBtn_turnRight}></div>
            </div>
          }
          {
            pageFlag2 && knapsackSelection == 2 && <div className={styles.part4_PageBtn}>
            <div onClick={turnLeft2} className={styles.part4_PageBtn_turnLeft}></div>
            <div className={styles.part4_PageBtn_PageInfo}></div>
            <div onClick={turnRight2} className={styles.part4_PageBtn_turnRight}></div>
            </div>            
          }
          <div className={styles.kindsOfKnapsack}>
            <div onClick={switchPost} className={ postFlag == true? styles.postKnapsack : styles.postKnapsackUnselected }>My Post</div>
            <div className={styles.delimiter}></div>
            <div onClick={switchCollected} className={collectionFlag == true? styles.collectionKnapsack : styles.collectionKnapsackUnselected}>My Collection</div>
          </div>
        </div>
      </div>
    </div>
  )
}
function BodyBExhibitionBlank(){
  // console.log(7)
    return(
      <div className={styles.bodyBExhibitionBlank}>
        <div className={styles.exhibitionBlankBg}></div>
        <div className={styles.exhibitionBlankFont}>Your solo exhibition is still in your mind</div>
      </div>
      )
}
function BodyBCollectionFull(){
  // console.log(6)
    return(
        <div className={styles.bodyBCollectionFull}></div>
      )
}
function BodyBExhibitionFull(){
  // console.log(8)
    return(
        <div className={styles.bodyBExhibitionFull}></div>
      )
}

export default function Home() {
  // console.log(0)
  const [width, setWidth] = React.useState(0)
  const [bodyACollectionFlag, setbodyACollectionFlag] = React.useState(true) 
  const [bodyAExhibitionFlag, setbodyAExhibitionFlag] = React.useState(false) 
  const [bodyBCollectionBlankFlag, setbodyBCollectionBlankFlag] = React.useState(true) 
  const [bodyBExhibitionBlankFlag, setbodyBExhibitionBlankFlag] = React.useState(true)
  const [addCollectionComponentFlag,setaddCollectionComponentFlag] =React.useState(false)
  /*********************************获取个人在LENS上的信息开*********************** */
  const [myProfile,setMyProfile] =React.useState()
  /*********************************获取个人在LENS上的信息关*********************** */
  /***************************获取个人在LENS上的出版物 开******************************/
  const [cursor,setCursor] = React.useState([null,null])
   /***************************获取个人在LENS上的出版物 关******************************/
  /*********************************获取用户在我们数据库 包含已创建图册的全图片数组，和图册对象 开*** */
  const [imgAllBeUsed,setImgAllBeUsed] =React.useState([])
  const [myBrochure,setMyBrochure] =React.useState({})
  /*********************************获取用户在我们数据库 包含已创建图册的全图片数组，和图册对象 关*** */
  /*****************************用来绘制背包图片1的数组*************************/
  const [knapsackPictures,setKnapsackPictures] =React.useState([])
   /*****************************用来绘制背包图片2的数组*************************/
  const [knapsackPictures2,setKnapsackPictures2] =React.useState([])
  /*****************************用来绘制背包里所有帖子图片的数组 *************************/
  const dataRef =React.useRef({cursor:[null,null],pictures:[]})
  /*****************************用来绘制背包里所有收藏品图片的数组 *************************/
  const dataRefCollections =React.useRef({cursor:[null,null],pictures:[]})
  React.useEffect(() => {
    console.log('UE0')
    /**********************************************根据窗口尺寸来调整html根元素fontsize************************************* **/
    const handleResize = () => {
      setWidth(window.innerWidth);
    }
    // setbodyACollectionFlag(false)
    var fz = window.innerWidth / (1440/28)
    if(fz<16){
      fz=16
    }
    if(fz>28){
      fz=28
    }
    // console.log(fz)
    document.documentElement.style.fontSize = fz+'px'
    // window.addEventListener('resize', handleResize)
    // return () => window.removeEventListener('resize', handleResize);
    /***********************************************根据窗口尺寸来调整html根元素fontsize ********************************************/
  }, [])
  return (
  <div className={styles.container}>
    <Header headerProps={{bodyACollectionFlag,bodyAExhibitionFlag,setbodyACollectionFlag,setbodyAExhibitionFlag,addCollectionComponentFlag,setaddCollectionComponentFlag,myProfile,setMyProfile}}></Header>
    {bodyACollectionFlag == true && <BodyACollection bodyACollectionProps={{setaddCollectionComponentFlag,myProfile,setMyProfile}}></BodyACollection>
    }
    {
      bodyAExhibitionFlag == true && <BodyAExhibition></BodyAExhibition>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == true && !addCollectionComponentFlag && <BodyBCollectionBlank></BodyBCollectionBlank>
    }
    {
      addCollectionComponentFlag == true && <AddCollectionComponent addCollectionComponentProps={{addCollectionComponentFlag,setaddCollectionComponentFlag,myProfile,setMyProfile,knapsackPictures,knapsackPictures2,setKnapsackPictures,setKnapsackPictures2,dataRef,dataRefCollections}} ></AddCollectionComponent>
    }
    {
      bodyACollectionFlag == true && bodyBCollectionBlankFlag == false && <BodyBCollectionFull></BodyBCollectionFull>
    }
    {
      bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == true && <BodyBExhibitionBlank></BodyBExhibitionBlank>
    }
    {
       bodyAExhibitionFlag == true && bodyBExhibitionBlankFlag == false && <BodyBExhibitionFull></BodyBExhibitionFull>
    }
    
  </div>
  )
}
