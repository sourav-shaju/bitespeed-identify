import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { IdentifyDto } from './identify.dto';

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
    let existingContacts = await this.contactRepository
      .createQueryBuilder('contact')
      .where('(contact.phoneNumber = :phoneNumber OR contact.email = :email)', {
        phoneNumber: identifyDto.phoneNumber,
        email: identifyDto.email,
      })
      .andWhere('contact.linkPrecedence = :linkPrecedence', { linkPrecedence: 'primary' })
      .orderBy('id', 'ASC')
      .getMany();
      
      //console.log("existingContacts**", existingContacts);
    if (existingContacts && existingContacts.length > 1) {
      await this.contactRepository
      .createQueryBuilder()
      .update()
      .set({ linkPrecedence: 'secondary', linkedId: existingContacts[0].id, updatedAt: new Date() })
      .where('id = :id', { id: existingContacts[1].id })
      .execute();

      let response={contact:{}};
      response.contact={
        primaryContactId: existingContacts[0].id,
        emails: [...existingContacts.map(contact => contact.email).filter(email => email)],
        phoneNumbers: [...existingContacts.map(contact => contact.phoneNumber).filter(phone => phone)],
        secondaryContactIds: [existingContacts[1].id]
      }
      return response
    }

    if (!existingContacts || existingContacts.length === 0) {      
      const secondaryContact = await this.contactRepository
        .createQueryBuilder('contact')
        .where('(contact.phoneNumber = :phoneNumber OR contact.email = :email)', {
          phoneNumber: identifyDto.phoneNumber,
          email: identifyDto.email,
        })
        .andWhere('contact.linkPrecedence = :linkPrecedence', { linkPrecedence: 'secondary' })
        .getOne();

      if (secondaryContact) {
        existingContacts = await this.contactRepository.find({
          where: { id: secondaryContact.linkedId },
        });
      }
    }

    if (existingContacts && existingContacts.length > 0) {
      let existingContact = existingContacts[0];
      let secondaryCheckQuery= this.contactRepository
      .createQueryBuilder('contact')

      if (identifyDto.email && identifyDto.phoneNumber) {
        secondaryCheckQuery.where(
          'contact.email = :email and contact.phoneNumber = :phoneNumber',
          {
            email: identifyDto.email,
            phoneNumber: identifyDto.phoneNumber,
          }
        );
      } else if (identifyDto.email) {
        secondaryCheckQuery.where('contact.email = :email', { email: identifyDto.email });
      } else if (identifyDto.phoneNumber) {
        secondaryCheckQuery.where('contact.phoneNumber = :phoneNumber', {
          phoneNumber: identifyDto.phoneNumber,
        });
      }
      let secondaryCheck= await secondaryCheckQuery.getOne();
      
      if(!secondaryCheck){
        identifyDto.linkedId = existingContact.id;
        identifyDto.linkPrecedence = "secondary";
        let contact=this.contactRepository.create(identifyDto);
        await this.contactRepository.save(contact);
      }
      
      const rows = await this.contactRepository
        .createQueryBuilder('contact')
        .select(['contact.id','contact.phoneNumber', 'contact.email'])
        .where('contact.linkedId=:linkedId and contact.linkPrecedence=:linkPrecedence', {
          linkedId: existingContact.id,
          linkPrecedence:"secondary"
        })
        .orderBy('id', 'ASC')
        .getRawMany();
      let phoneNumbersArr = rows.map(row => row.contact_phoneNumber);
      let emailsArr = rows.map(row => row.contact_email);
      let secondaryContactIdsArr = rows.map(row => row.contact_id);
      phoneNumbersArr.unshift(existingContact.phoneNumber);
      emailsArr.unshift(existingContact.email);
    
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
        let response={contact:{}};
        response.contact={
          primaryContactId: saveResponse.id,
          emails: [`${saveResponse.email}`],
          phoneNumbers: [`${saveResponse.phoneNumber}`],
          secondaryContactIds: []
        }
        return response
      }
    }
  
}
