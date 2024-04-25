import minimist from 'minimist';
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { v4 as uuidv4 } from "uuid"
import { callFetchPost, callFetchGet, getCHeader } from './api.js' 
import CF from "codice-fiscale-js"


function printToSameLine(string) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(string);
}
function titleCase(str) {
    if (str && str.length > 0) {
        const words = str.split(" ");

        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].toLowerCase();
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }

        return(words.join(" "))
    }
    return(str)
}

function isUrlCorrect(url) {
    try {
        // if url is a string and not starts with http or https, add http
        if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('https')) {
            url = `http://${url}`;
        }
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function decodeCF(cf) {
    try {
        let ret = {}
        if (cf && typeof(cf) == 'string' && cf != "" && cf.length == 16) {
            ret = new CF(cf)
        }
        return ret
    } catch (error) {
        return null
    }
}

function isValidCF(cf) {
    if (cf && typeof (cf) == 'string' && cf != "" && cf.length == 16) {
        const decoded = decodeCF(cf)
        if (decoded)
            return true
    }
    return false
}

function completeFromCF(cf, profile) {
    if (cf.birthplace) {
        if (profile.gender == 'ND')
            profile.gender = cf.gender
        if (profile.bdate == '')
            profile.bdate = JSON.stringify(cf.birthday).split('T')[0].replaceAll('"', '')
        if (cf.birthplace.prov != 'EE') {
            if (profile.bcity == '')
                profile.bcity = cf.birthplace.nome
            if (profile.bprovince == '')
                profile.bprovince = cf.birthplace.prov
            profile.bcountry = 'IT'
        } else {
            if (profile.bcountry == '')
                if (cf.birthplace.nome.length == 2)
                    profile.bcountry = cf.birthplace.nome
                else {
                    switch (cf.birthplace.nome.toUpperCase()) {
                        case 'MESSICO':
                            profile.bcountry = 'MX'
                            break;
                        case 'GERMANIA':
                            profile.bcountry = 'DE'
                            break;
                        case 'SVIZZERA':
                            profile.bcountry = 'CH'
                            break;
                    }
                }       
         }
    }

}

const main = async () => {
    let argv = minimist(process.argv.slice(2));
    process.env.DB = argv.d ? argv.d : 'memory'
    process.env.CSV = argv.c ? argv.c : 'OLDUSERS.csv'
    process.env.PATH = argv.p ? argv.p : ''
    process.env.ROOTUSER = argv.r ? argv.r : 'root@root.com'
    process.env.ROOTPWD = argv.w ? argv.w : 'root'
    process.env.URL = argv.u ? argv.u : 'https://localhost:3001'
    process.env.CSV2 = argv.c2 ? argv.c2 : 'VIEWELAB.csv'
    process.env.CSVCOMPANY = argv.cc ? argv.cc : 'COMPANY.csv'
    process.env.MIGRATE = argv.m ? argv.m : 'csv'
    
    if (argv.h) {
        console.log("USAGE: node userMigrate.js -d <db> -c <csvfile> -p <path> -r <rootuser> -w <rootpwd> -u <url> -m<[csv]|db>")
        process.exit(0)
    }

    const filepath = path.join(process.env.PATH, process.env.CSV)
    const filepath2 = path.join(process.env.PATH, process.env.CSV2)
    const filepath3 = path.join(process.env.PATH, process.env.CSVCOMPANY)
    const options = { header: true, skipEmptyLines: true, dynamicTyping: true }
    const credentials = []
    const profiles = []
    const profprofiles = []
    const companies = []
    const profilescompanies = []
    let token = ''
    let key = ''

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    try {
        const raw = fs.readFileSync(filepath, 'utf-8')
        const data = await Papa.parse(raw, options)
        const rw2 = fs.readFileSync(filepath2, 'utf-8')
        const data2 = await Papa.parse(rw2, options)
        const rw3 = fs.readFileSync(filepath3, 'utf-8')
        const data3 = await Papa.parse(rw3, options)

        

        // START CYCLE UPON ALL OLD USERS
        for (let i = 0; i < data.data.length; i++) {
            const user = data.data[i];
            const uid = uuidv4()
            const status = user.active == 1 ? 'active' : 'inactive'
            let role = 'USER'
            switch (user.is_admin) {
                case 1:
                    role = 'ADMIN'
                    break;
                case 2:
                    role = 'SADMIN'
                    break;
            }
            let profile = {
                uid: '',
                name: '',
                surname: '',
                nlsubscription: false,
                ppolicy: false,
                gender: 'ND',
                image: '',
                address: '',
                city: '',
                state:'',
                region: '',
                country: '',
                zip: '',
                bcountry: '',
                bstate: '',
                bprovince: '',
                bcity: '',
                bdate: '',
                idnumber: '',
                idtype: '',
                idvalidity: '',
                mobile: '',
                otherphone: '',
                linkedin: '',
                facebook: '',
                twitter: '',
                instagram: '',
                skype: '',
                whatsapp: '',
                telegram: '',
                othersocial: '',
                owner: '',
                shortbio: '',
                sectors: [],
                skills: [],
                languages: [],
                education: '',
                profexp1: '',
                profexp2: '',
                profexp3: '',
                website: '',
                owner: '',
                profession: '',
                taxcode: '',
                createdAt: '',
            }
           
            const up2id = {
                uid: uid,
                username: user.email,
                password: user.email,
                role: role,
                name: user.firstname,
                surname: user.lastname,
                status: status,
            }


            // ADD USER DETAILS
            for (let j = 0; j < data2.data.length; j++) {
                const user2 = data2.data[j];
                if (user2.email == user.email) {
                    profile.gender = user2.gender && user2.gender != '' && user2.city != 'NULL' ? user2.gender : 'ND'
                    profile.address = user2.address && user2.address != '' && user2.address != 'NULL' ? titleCase( user2.address) : ''
                    profile.city = user2.city && user2.city != '' && user2.city != 'NULL' ? titleCase(user2.city) : ''
                    profile.zip = user2.zip_code && user2.zip_code != '' && user2.zip_code != 'NULL' ? user2.zip_code : ''
                    profile.bcountry = user2.birthcountry && user2.birthcountry != '' && user2.birthcountry != 'NULL' ? user2.birthcountry.toUpperCase() : ''
                    profile.bstate = user2.birthstate && user2.birthstate != '' && user2.birthstate != 'NULL' ? titleCase(user2.birthstate) : ''
                    profile.bprovince = user2.birthprovince && user2.birthprovince != '' && user2.birthprovince != 'NULL' ? user2.birthprovince.toUpperCase() : ''
                    profile.bcity = user2.birthcity && user2.birthcity != '' && user2.birthcity != 'NULL' ? titleCase(user2.birthcity) : ''
                    profile.bdate = user2.birthdate && user2.birthdate != '' && user2.birthdate != 'NULL' ? user2.birthdate : ''
                    profile.mobile = user2.phone_number_1 && user2.phone_number_1 != '' && user2.phone_number_1 != 'NULL' ? user2.phone_number_1 : ''
                    profile.otherphone = user2.phone_number_2 && user2.phone_number_2 != '' && user2.phone_number_2 != 'NULL' ? user2.phone_number_2 : ''
                    profile.linkedIn = user2.linkedin && user2.linkedin != '' && user2.linkedin != 'NULL' && isUrlCorrect(user2.linkedin)? user2.linkedin : ''
                    profile.facebook = user2.facebook && user2.facebook != '' && user2.facebook != 'NULL' && isUrlCorrect(user2.facebook )? user2.facebook : ''
                    profile.twitter = user2.twitter && user2.twitter != '' && user2.twitter != 'NULL' && isUrlCorrect(user2.twitter)? user2.twitter : ''
                    profile.instagram = user2.instagram && user2.instagram != '' && user2.instagram != 'NULL' && isUrlCorrect(user2.instagram) ? user2.instagram : ''
                    profile.othersocial = user2.sociallink1 && user2.sociallink1 != '' && user2.sociallink1 != 'NULL' && isUrlCorrect(user2.sociallink1) ? user2.sociallink1 : ''
                    profile.image = user2.avatar && user2.avatar != '' && user2.avatar != 'NULL' ? user2.avatar : ''
                    profile.idnumber = user2.idnumber && user2.idnumber != '' && user2.idnumber != 'NULL' && typeof(user2.idnumber) == 'string'? user2.idnumber.toUpperCase() : ''
                    profile.idtype = user2.idtype && user2.idtype != '' && user2.idtype != 'NULL' ? user2.idtype : ''
                    profile.idvalidity = user2.idvalidity && user2.idvalidity != '' && user2.idvalidity != 'NULL' ? user2.idvalidity : ''
                    profile.website = user2.website && user2.website != '' && user2.website != 'NULL' && isUrlCorrect(user2.website) ? user2.website : ''
                    profile.profession = user2.role && user2.role != '' && user2.role != 'NULL' ? user2.role : ''
                    profile.taxcode = user2.taxcode && user2.taxcode != '' && user2.taxcode != 'NULL' && typeof (user2.taxcode) == 'string' && isValidCF(user2.taxcode)? user2.taxcode.toUpperCase() : ''
                }
            }
            profile.name = user.firstname
            profile.surname = user.lastname
            profile.uid = uid
            profile.createdAt = new Date().toISOString()
            profile.owner = uid
            profile.shortbio = user.primary_bio ? user.primary_bio : ''
            if (isValidCF(profile.taxcode)) {
                const decoded = decodeCF(profile.taxcode)
                completeFromCF(decoded, profile)
            }

            credentials.push(up2id)
            profiles.push(profile)
          

        }
        // START CYCLE UPON ALL COMPANIES
        for (let i = 0; i < data3.data.length; i++) {
            const company2 = data3.data[i];
            const uid = uuidv4()
            const status = company2.active == 1 ? 'active' : 'inactive'
            let company = {
                uid: uid,
                name: company2.name,
                sectors: company2.sectors ? company2.sectors.split(',') : [],
                country: company2.country ? company2.country:'',
                state: company2.state ? company2.state:'',
                province: company2.province ? company2.province:'',
                city: company2.city ? company2.city:'',
                address: company2.address ? company2.address:'',
                zip: company2.zip ? company2.zip:'',
                startdate: company2.startdate ? company2.startdate:'',
                uoc: company2.uoc ? company2.uoc:'',
                uoctype: company2.uoctype ? company2.uoctype:'',
                taxcode: company2.taxcode ? company2.taxcode:'',
                vatcode: company2.vatcode ? company2.vatcode:'',
                note: company2.note ? company2.note : '',
                website: company2.website ? company2.website : '',
                owner: uuidv4(),
                createdAt: company2.createdAt ? company2.createdAt:new Date().toISOString()
            }
            companies.push(company)
            // chcek company profile
            const found = data.data.find((item) => item.id == company2.userid)
            if (found) {
                const credential = credentials.find((item) => item.username == found.email)
                let profilescompany = {
                    cuid: company.uid,
                    puid: credential ? credential.uid:'',
                    addedAt: new Date().toISOString()
                }
                profilescompanies.push(profilescompany)
            }
        }
        // START MIGRATION
        // LOGIN AS ROOT
        switch (process.env.MIGRATE) {
            case "db":
                console.log("START MIGRATING USERS ON DB: ", process.env.DB)
                let body = {
                    type: "username-password",
                    username: process.env.ROOTUSER,
                    password: process.env.ROOTPWD
                }
                let url = process.env.URL + '/login'
                let ret = await callFetchPost(url, body)
                token = ret.response.token
                key = ret.response.key
                console.log(" ************ MIGRATE CREDENTIALS ***********")
                console.log(" 1) DELETE OLD CREDENTIALS\n")
                url = process.env.URL + '/clearusers'
                body = {
                    type: "clear",
                }
                let cheaders = getCHeader(token, key)
                ret = await callFetchPost(url, body, cheaders)
                console.log(" 2) INSERT NEW CREDENTIALS\n")
                for (let i = 0; i < credentials.length; i++) {
                    let cred = credentials[i]
                    let body = {
                        type: "username-password",
                        username: cred.username,
                        password: cred.username,
                        userobject: {
                            name: cred.name,
                            surname: cred.surname,
                            permissions: null,
                            role: cred.role,
                            status: (cred.role == 'SADMIN' || cred.role == 'ADMIN') ? 'active' : cred.status,
                            confirmationCode: null
                        }
                    }
                    let url = process.env.URL + '/createuser'
                    let cheaders = getCHeader(token, key)
                    try {
                        let ret = await callFetchPost(url, body, cheaders)
                        // GET CREATED USER
                        body = {
                            filter: [{
                                username: cred.username,
                                type: 'eq'
                            }]
                        }
                        url = process.env.URL + '/listusers'
                        ret = await callFetchPost(url, body, cheaders)

                        printToSameLine(cred.username)
                        //console.log("CREATED USER", cred.username, ret)
                    } catch (error) {
                        //if (typeof error.message == 'string' && !error.message.includes('CREDENTIAL_USERNAME_ALREADY_EXISTS'))
                        console.log("ERROR", cred.username, error)
                    }
                }
                // ADD DEVELOPERS
                console.log("\nADD DEVELOPERS:")
                const dev1 = {
                    type: "username-password",
                    username: 'lclerico@oscr.it',
                    password: 'lclerico',
                    userobject: {
                        name: 'Lorenzo',
                        surname: 'Clerico',
                        permissions: [],
                        role: 'SADMIN',
                        status: 'active',
                        confirmationCode: null
                    }
                }
                url = process.env.URL + '/createuser'
                cheaders = getCHeader(token, key)
                try {
                    ret = await callFetchPost(url, dev1, cheaders)
                    //console.log("CREATE DEV1", dev1.username, ret)
                }catch(error) {
                    console.log("ERROR", dev1.username, error)
                }
                console.log("\n 3) DELETE OLD PROFILES")
                let clearprofiles = {
                    type: "api",
                    version: 1.0,
                    command: "deleteProfile",
                    options: {uid:'all'}
                }
                url = process.env.URL + '/command'
                cheaders = getCHeader(token, key)
                ret = await callFetchPost(url, clearprofiles, cheaders)
                console.log("\n 4) INSERT NEW PROFILES")
                for (let i = 0; i < profiles.length; i++) {
                    let prof = profiles[i]
                    let body = {
                        type: "api",
                        version: 1.0,
                        command: "insertProfile",
                        options:prof
                    }
                    let url = process.env.URL + '/command'
                    let cheaders = getCHeader(token, key)
                    try {
                        let ret = await callFetchPost(url, body, cheaders)
                        // GET CREATED PROFILE
                        body = {
                            type: "api",
                            version: 1.0,
                            command: "getProfile",
                            options: [
                                {
                                    uid: prof.uid,
                                    type: 'eq'
                                }
                            ]
                        }
                        url = process.env.URL + '/command'
                        ret = await callFetchPost(url, body, cheaders)
                 
                        if (ret && ret.data && ret.data.profiles )
                            printToSameLine(ret.data.profiles[0].uid)
                        //console.log("CREATED USER", cred.username, ret)
                    } catch (error) {
                        //if (typeof error.message == 'string' && !error.message.includes('CREDENTIAL_USERNAME_ALREADY_EXISTS'))
                        console.log("ERROR", error)
                    }
                }
                // ADD COMPANIES
                console.log("\n 5) DELETE OLD COMPANIES")
                let clearcompanies = {
                    type: "api",
                    version: 1.0,
                    command: "deleteCompany",
                    options: { uid: 'all' }
                }
                url = process.env.URL + '/command'
                cheaders = getCHeader(token, key)
                ret = await callFetchPost(url, clearcompanies, cheaders)
                console.log("\n 6) INSERT NEW COMPANIES")
                for (let i = 0; i < companies.length; i++) {
                    let comp = companies[i]
                    let body = {
                        type: "api",
                        version: 1.0,
                        command: "insertCompany",
                        options: comp
                    }
                    let url = process.env.URL + '/command'
                    let cheaders = getCHeader(token, key)
                    try {
                        let ret = await callFetchPost(url, body, cheaders)
                        // GET CREATED PROFILE
                        body = {
                            type: "api",
                            version: 1.0,
                            command: "getCompany",
                            options: [
                                {
                                    uid: comp.uid,
                                    type: 'eq'
                                }
                            ]
                        }
                        url = process.env.URL + '/command'
                        ret = await callFetchPost(url, body, cheaders)

                        if (ret  && ret.data && ret.data.companies)
                            printToSameLine(ret.data.companies[0].uid)
                        //console.log("CREATED USER", cred.username, ret)
                    } catch (error) {
                        //if (typeof error.message == 'string' && !error.message.includes('CREDENTIAL_USERNAME_ALREADY_EXISTS'))
                        console.log("ERROR", error)
                    }
                }
                // ADD PROFILE-COMPANY
                console.log("\n 7) ADD OLD PROFILE-COMPANY")
                for (let i = 0; i < profilescompanies.length; i++) {
                    let profcomp = profilescompanies[i]
                    let body = {
                        type: "api",
                        version: 1.0,
                        command: "addProfilesToCompany",
                        options: {
                            profiles: [profcomp.puid],
                            uid: profcomp.cuid
                        }
                    }
                    let url = process.env.URL + '/command'
                    let cheaders = getCHeader(token, key)
                    try {
                        let ret = await callFetchPost(url, body, cheaders)
                        printToSameLine(profcomp.cuid)
                    } catch (error) {
                        //if (typeof error.message == 'string' && !error.message.includes('CREDENTIAL_USERNAME_ALREADY_EXISTS'))
                        console.log("ERROR", error)
                    }
                }
                break;
            default:
                console.log("PRINT ON CSV FILES: credential.csv,profile.csv,profprofile.csv")
                const credcsv = path.join(__dirname, 'credentials.csv')
                const perscsv = path.join(__dirname, 'profile.csv')
                //const profcsv = path.join(__dirname, 'profprofile.csv')
                const compcsv = path.join(__dirname, 'company.csv')

                const profcomps = path.join(__dirname, 'profilecompany.csv')
                fs.writeFileSync(credcsv, Papa.unparse(credentials, {delimiter:';'}), 'utf-8')
                fs.writeFileSync(perscsv, Papa.unparse(profiles, { delimiter: ';' }), 'utf-8')
                //fs.writeFileSync(profcsv, Papa.unparse(profprofiles, { delimiter: ';' }), 'utf-8')
                fs.writeFileSync(compcsv, Papa.unparse(companies, { delimiter: ';' }), 'utf-8')
                fs.writeFileSync(profcomps, Papa.unparse(profilescompanies, { delimiter: ';' }), 'utf-8')
                break
        } 

    } catch (error) {
        console.log(error)
        process.exit(-1)
    }
}

main()