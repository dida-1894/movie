(async () => {
    console.log('case1: B来到你面前')
    await You.doSync('你在和A谈话', 1000)
    console.log('B什么也没有干，就一直等')
    await B.doSync('')
})()