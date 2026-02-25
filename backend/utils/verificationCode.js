export default () => {
  let uid = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    uid += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return uid;
};
