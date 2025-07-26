// import TicketCard from '@/components/TicketCard';
// import React, { useState } from 'react';
// import { FlatList } from 'react-native';

// export default function TicketListScreen() {
//   const [tickets, setTickets] = useState([
//     {
//       id: '1',
//       title: 'K-Pop 투어: BTS',
//       location: '서울 홍대',
//       startDate: '25.07.04',
//       progress: 88,
//       imageSource: require('../../assets/images/sample-stage.png')
//     },
//     // ...다른 더미 데이터
//     {
//       id: '2',
//       title: 'K-POP 루트: idol',
//       location: '서울 마포',
//       startDate: '25.07.10',
//       progress: 56,
//       imageSource: require('../../assets/images/sample-stage.png'),
//     },
//   ]);

//   const handleDelete = (id: string) => {
//     setTickets(prev => prev.filter(ticket => ticket.id !== id));
//   };

//   return (
//     <FlatList
//       data={tickets}
//       keyExtractor={item => item.id}
//       renderItem={({ item }) => (
//         <TicketCard
//           title={item.title}
//           location={item.location}
//           startDate={item.startDate}
//           progress={item.progress}
//           imageSource={item.imageSource}
//           onDelete={() => handleDelete(item.id)}
//         />
//       )}
//     />
//   );
// }
