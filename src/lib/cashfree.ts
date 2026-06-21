import { Cashfree, CFEnvironment } from 'cashfree-pg'

const CASHFREE_ENV = process.env?.CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

const cashfree = new Cashfree(CASHFREE_ENV, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY)

export default cashfree;
