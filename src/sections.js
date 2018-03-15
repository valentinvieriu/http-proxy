module.exports = {
  api: `<script type="text/javascript" src="/etc/clientlibs/digitals2/clientlib/api.min.20180216002220.min.js"></script>`,
  base: `<script type="text/javascript" src="/etc/clientlibs/digitals2/clientlib/base.min.20180216002220.min.js"></script>`,
  gcdm: `<script src="https://www.p28.bmw.com/formcomponentsV2/js/gcdm.js"></script>`,
  angular: `<script src="https://www.p28.bmw.com/formcomponentsV2/js/angular.min.js"></script>`,
  satelliteLib: `<script type="text/javascript" src="//assets.adobedtm.com/7e530431ebc6040a493335ce44e66648adfeab7a/satelliteLib-ce1cfaf4fe42ee46e31ae2fff23205e01c445d88.js"></script>`,
  secondLevelMenu: new RegExp(
    /<ul class="ds2-navigation-main--level-3 ds2-navigation-main--list">*.<\/ul>/,
    'g'
  )
};
