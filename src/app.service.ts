import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { IdentifyDto } from './identify.dto';
import { link } from 'fs';


@Injectable()
export class AppService {

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async identify(identifyDto:IdentifyDto){
    const existingContact = await this.contactRepository
      .createQueryBuilder('contact')
      .where('(contact.phoneNumber = :phoneNumber OR contact.email = :email)', {
        phoneNumber: identifyDto.phoneNumber,
        email: identifyDto.email,
      })
      .andWhere('contact.linkPrecedence = :linkPrecedence', { linkPrecedence: 'primary' })
      .getOne();
    if (existingContact) {
      // If contact exists, return it
      let secondaryCheck= await this.contactRepository
      .createQueryBuilder('contact')
      .where('(contact.phoneNumber = :phoneNumber and contact.email = :email)', {
        phoneNumber: identifyDto.phoneNumber,
        email: identifyDto.email,
      })
      .getOne();
      console.log("secondaryCheck**", secondaryCheck);
      if(!secondaryCheck){
        //console.log("secondaryCheck", secondaryCheck);
        identifyDto.linkedId = existingContact.id;
        identifyDto.linkPrecedence = "secondary";
        let contact=this.contactRepository.create(identifyDto);
        await this.contactRepository.save(contact);
      }
      
      
      const rows = await this.contactRepository
        .createQueryBuilder('contact')
        .select(['contact.id','contact.phoneNumber', 'contact.email'])
        .where('(contact.phoneNumber = :phoneNumber OR contact.email = :email) and contact.linkPrecedence=:linkPrecedence', {
          phoneNumber: identifyDto.phoneNumber,
          email: identifyDto.email,
          linkPrecedence:"secondary"
        })
        .orderBy('id', 'ASC')
        .getRawMany();
      let phoneNumbersArr = rows.map(row => row.contact_phoneNumber);
      let emailsArr = rows.map(row => row.contact_email);
      let secondaryContactIdsArr = rows.map(row => row.contact_id);
      phoneNumbersArr.unshift(existingContact.phoneNumber);
      emailsArr.unshift(existingContact.email);
    //console.log(rows)
    let response={contact:{}};
      response.contact={
        primaryContactId: existingContact.id,
        emails: [...new Set(emailsArr)],
        phoneNumbers: [...new Set(phoneNumbersArr)],
        secondaryContactIds: secondaryContactIdsArr
      }
      return response
    }else{
      identifyDto.linkPrecedence = "primary";
      let contact=this.contactRepository.create(identifyDto);
      let saveResponse=await this.contactRepository.save(contact);
      //console.log("saveResponse", saveResponse);
      let response={contact:{}};
      response.contact={
        primaryContactId: saveResponse.id,
        emails: [`${saveResponse.email}`],
        phoneNumbers: [`${saveResponse.phoneNumber}`],
        secondaryContactIds: []
      }
      return response
    }
    // // If contact does not exist, create a new one
    // // Set linkPrecedence based on the presence of phoneNumber and email
    // let linkPrecedence = '';
    // if (identifyDto.phoneNumber && identifyDto.email) {
    //   linkPrecedence = 'phoneNumber, email';
    // }

    
  }
  
}
